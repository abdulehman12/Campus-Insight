import { Injectable, Logger, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HfInference } from "@huggingface/inference";
import { RegExpMatcher, englishDataset } from "obscenity";
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import * as ffprobeStatic from 'ffprobe-static';
import sharp from 'sharp';

const REAL_FFMPEG_PATH = (ffmpegStatic as any).default || ffmpegStatic;
const REAL_FFPROBE_PATH = (ffprobeStatic as any).path || ffprobeStatic;

ffmpeg.setFfmpegPath(REAL_FFMPEG_PATH);
ffmpeg.setFfprobePath(REAL_FFPROBE_PATH);

const CUSTOM_POLITICAL_KEYWORDS = ['election', 'politics', 'protest', 'strike', 'dharna', 'imran khan', 'nawaz', 'pti', 'pmln', 'bjp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

@Injectable()
export class AIProcessorService {
    private readonly logger = new Logger(AIProcessorService.name);
    private hf: HfInference | null = null;
    private profanityMatcher: RegExpMatcher;

    constructor(private readonly configService: ConfigService) {
        this.profanityMatcher = new RegExpMatcher(englishDataset.build());

        const hfToken = this.configService.get<string>('HUGGINGFACE_API_KEY');
        if (hfToken) {
            this.hf = new HfInference(hfToken);
            this.logger.log(`AI Core Processor online. Multi-Model Safety Router ready.`);
        } else {
            this.logger.warn(`AI Core Processor initialized WITHOUT cloud token.`);
        }
    }

    /**
     * AI & Pattern Deep Text Scanner
     */
    async analyzeTextAI(text: string): Promise<{ isFlagged: boolean; reason: string | null }> {
        if (!text || text.trim().length === 0) {
            return { isFlagged: false, reason: null };
        }

        const cleanText = text.toLowerCase().trim();

        if (this.profanityMatcher.hasMatch(cleanText)) {
            this.logger.warn(`Text block intercepted by Obscenity Engine.`);
            return { isFlagged: true, reason: 'Toxic, Profane, or Illicit Language' };
        }

        const hasPolitics = CUSTOM_POLITICAL_KEYWORDS.some(word => new RegExp(`\\b${word}\\b`, 'i').test(cleanText));
        if (hasPolitics) {
            this.logger.warn(`Text block intercepted by Custom Political Filter.`);
            return { isFlagged: true, reason: 'Political Content or Affiliation' };
        }

        if (!this.hf) {
            throw new InternalServerErrorException('AI Moderation token is missing from environment config.');
        }

        try {
            const predictions = await this.hf.textClassification({
                model: 'facebook/roberta-hate-speech-dynabench-r4-target',
                inputs: text
            });

            const hateLabel = predictions.find((p: any) => p.label.toLowerCase() === 'hate');
            if (hateLabel && hateLabel.score > 0.65) {
                this.logger.warn(`Text block flagged by Cloud AI Model. Score: ${hateLabel.score}`);
                return { isFlagged: true, reason: 'Toxic or Profane Language' };
            }
        } catch (error: any) {
            this.logger.error(`CRITICAL: Text AI validation failed: ${error.message}`);
            throw new InternalServerErrorException(`Security validation offline: ${error.message}`);
        }

        return { isFlagged: false, reason: null };
    }

    /**
     * Extracts a single frame from a video file and saves it temporarily
     */
    private extractVideoFrame(videoPath: string, outputDir: string, tempFilename: string): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['00:00:01.000'],
                    filename: tempFilename,
                    folder: outputDir,
                    size: '640x?'
                })
                .on('end', () => {
                    resolve(path.join(outputDir, tempFilename));
                })
                .on('error', (err) => {
                    reject(err);
                });
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Fallback Scanner utilizing a traditional pipeline to scan images directly 
     * if the Primary LLM service experiences provider downtime.
     */
    private async runFallbackSafetyScan(imageBuffer: Buffer): Promise<{ isFlagged: boolean; reason: string | null }> {
        this.logger.warn(`LAUNCHING FALLBACK PIPELINE: Routing content to alternate image classification gates...`);
        try {
            // ✅ Fix Content-Type issue using globalThis execution to cleanly pass standard binary Blobs
            const safeBlob = new (globalThis as any).Blob([imageBuffer], { type: 'image/jpeg' });

            const predictions = await this.hf!.imageClassification({
                model: 'Falconsai/nsfw_image_detection',
                data: safeBlob
            });

            const nsfwLabel = predictions.find((p: any) => p.label.toLowerCase() === 'nsfw');
            if (nsfwLabel && nsfwLabel.score > 0.70) {
                this.logger.warn(`Content caught by Fallback Engine. NSFW score: ${nsfwLabel.score}`);
                return { isFlagged: true, reason: 'Explicit content or adult elements flagged.' };
            }

            return { isFlagged: false, reason: null };
        } catch (fallbackError: any) {
            this.logger.error(`CRITICAL: Secondary emergency classification node failed: ${fallbackError.message}`);
            throw new InternalServerErrorException(`All upstream validation layers failed: ${fallbackError.message}`);
        }
    }

    /**
     * Multi-Media Vision Safety Router with local processing optimization and provider resilience
     */
    async analyzeMediaFile(filename: string): Promise<{ isFlagged: boolean; reason: string | null }> {
        if (!filename) return { isFlagged: false, reason: null };

        const uploadsDir = path.join(process.cwd(), 'uploads', 'insights');
        const filePath = path.join(uploadsDir, filename);

        if (!fs.existsSync(filePath)) {
            this.logger.warn(`Media file not found at path: ${filePath}. Skipping scan.`);
            return { isFlagged: false, reason: null };
        }

        if (!this.hf) {
            throw new InternalServerErrorException('Image/Video Moderation token is missing from environment config.');
        }

        const ext = path.extname(filename).toLowerCase();
        const isVideo = VIDEO_EXTENSIONS.includes(ext);
        
        let mediaToScanPath = filePath;
        let tempFramePath: string | null = null;
        let optimizedBuffer: Buffer | null = null;

        try {
            // 1. Video Slicing Phase
            if (isVideo) {
                this.logger.log(`Extracting processing thumbnail frame from video file: ${filename}`);
                const tempFrameName = `thumb-${Date.now()}-${filename}.jpg`;
                tempFramePath = await this.extractVideoFrame(filePath, uploadsDir, tempFrameName);
                mediaToScanPath = tempFramePath;
            }

            // 2. High-Performance Local Image Compression
            this.logger.log(`Compacting visual frame textures via Sharp Engine...`);
            optimizedBuffer = await sharp(mediaToScanPath)
                .resize(512, 512, { fit: 'inside' }) 
                .jpeg({ quality: 70, progressive: true })
                .toBuffer();

            // Clean up the temporary video thumbnail immediately
            if (tempFramePath && fs.existsSync(tempFramePath)) {
                fs.unlinkSync(tempFramePath);
                tempFramePath = null;
            }

            this.logger.log(`Dispatching optimized target context (${(optimizedBuffer.length / 1024).toFixed(1)} KB) to Hugging Face router.`);

            // 3. Resilient Request Loop via Stable Direct Classification Engine
            let attempts = 0;
            const maxAttempts = 3;
            let predictions: any = null;
            let primaryLayerFailed = false;

            // Explicitly build standard Blob to satisfy Content-Type headers downstream
            const safePrimaryBlob = new (globalThis as any).Blob([optimizedBuffer], { type: 'image/jpeg' });

            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    
                    // ✅ Switched to a reliable standard classification pipeline model to prevent server timeout drops
                    predictions = await this.hf.imageClassification({
                        model: 'Falconsai/nsfw_image_detection',
                        data: safePrimaryBlob
                    });
                    
                    break; 
                } catch (error: any) {
                    this.logger.warn(`Inference attempt [${attempts}/${maxAttempts}] failed via proxy provider: ${error.message}`);
                    
                    if (attempts >= maxAttempts) {
                        primaryLayerFailed = true;
                    } else {
                        const waitTime = attempts * 1500;
                        this.logger.log(`Backing off for ${waitTime}ms before re-dispatching...`);
                        await this.sleep(waitTime);
                    }
                }
            }

            // 4. Fallback execution if Primary routing fails completely
            if (primaryLayerFailed) {
                return await this.runFallbackSafetyScan(optimizedBuffer);
            }

            // Evaluate assessment results
            const nsfwLabel = predictions?.find((p: any) => p.label.toLowerCase() === 'nsfw');
            if (nsfwLabel && nsfwLabel.score > 0.70) {
                this.logger.warn(`Media file [${filename}] was caught by Safety Engine. Score: ${nsfwLabel.score}`);
                return { 
                    isFlagged: true, 
                    reason: 'Media breaks community policies (Explicit content or adult elements flagged).' 
                };
            }

            return { isFlagged: false, reason: null };

        } catch (error: any) {
            if (tempFramePath && fs.existsSync(tempFramePath)) {
                fs.unlinkSync(tempFramePath);
            }

            this.logger.error(`CRITICAL: Hugging Face Multimodal Vision Pipeline failed completely: ${error.message}`);
            throw new InternalServerErrorException(`Media safety validation offline: ${error.message}`);
        }
    }
}