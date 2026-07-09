import { useState, useRef, useEffect } from 'react';
import {
  Send,
  X,
  Tag,
  MapPin,
  Calendar,
  Trophy,
  Newspaper,
  Megaphone,
  Image as ImageIcon,
  Video,
  Dumbbell,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Paperclip,
} from 'lucide-react';
import { BACKEND_URL } from '../../config/api';

// ── Types ─────────────────────────────────────────────────────────────────────

const InsightType = {
  TEXT:         'text',
  IMAGE:        'image',
  VIDEO:        'video',
  EVENT:        'event',
  ANNOUNCEMENT: 'announcement',
  ACHIEVEMENT:  'achievement',
  SPORTS:       'sports',
} as const;

type InsightType = typeof InsightType[keyof typeof InsightType];

interface FormState {
  type: InsightType;
  title: string;
  content: string;
  tagList: string[];
  location: string;
  eventDate: string;
  awardDetail: string;
}

interface FieldErrors {
  type?: string;
  title?: string;
  content?: string;
  location?: string;
  eventDate?: string;
  awardDetail?: string;
  file?: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  [InsightType.TEXT]: {
    icon: Newspaper,
    label: 'Text',
    color: 'text-primary',
    bg: 'bg-primary/10',
    activeBg: 'bg-primary',
    description: 'Share knowledge or start a discussion',
  },
  [InsightType.IMAGE]: {
    icon: ImageIcon,
    label: 'Image',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    activeBg: 'bg-violet-500',
    description: 'Share a photo or visual insight',
  },
  [InsightType.VIDEO]: {
    icon: Video,
    label: 'Video',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    activeBg: 'bg-pink-500',
    description: 'Share a video link or recording',
  },
  [InsightType.EVENT]: {
    icon: Calendar,
    label: 'Event',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    activeBg: 'bg-blue-500',
    description: 'Announce an upcoming campus event',
  },
  [InsightType.ANNOUNCEMENT]: {
    icon: Megaphone,
    label: 'Announcement',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    activeBg: 'bg-rose-500',
    description: 'Broadcast important information',
  },
  [InsightType.ACHIEVEMENT]: {
    icon: Trophy,
    label: 'Achievement',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    activeBg: 'bg-amber-500',
    description: 'Celebrate a win or milestone',
  },
  [InsightType.SPORTS]: {
    icon: Dumbbell,
    label: 'Sports',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    activeBg: 'bg-green-500',
    description: 'Share a sports update or result',
  },
};

const INITIAL_FORM: FormState = {
  type: InsightType.TEXT,
  title: '',
  content: '',
  tagList: [],
  location: '',
  eventDate: '',
  awardDetail: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const getToken = () => localStorage.getItem('authToken') ?? '';

const validate = (form: FormState, file: File | null): FieldErrors => {
  const errors: FieldErrors = {};

  if (!form.title.trim())             errors.title = 'Title is required.';
  else if (form.title.length < 5)     errors.title = 'Title must be at least 5 characters.';
  else if (form.title.length > 100)   errors.title = 'Title must be 100 characters or fewer.';

  if (!form.content.trim())           errors.content = 'Description is required for all posts to keep the feed informative.';
  else if (form.content.length < 10)  errors.content = 'Please write at least 10 characters of content.';

  if (form.type === InsightType.IMAGE && !file) {
    errors.file = 'Please attach an image file for this insight type.';
  }
  if (form.type === InsightType.VIDEO && !file) {
    errors.file = 'Please attach a video file for this insight type.';
  }

  if (form.type === InsightType.EVENT) {
    if (!form.location.trim())        errors.location = 'Location is required for campus events.';
    if (!form.eventDate)              errors.eventDate = 'Event date and time are required for events.';
  }

  if (form.type === InsightType.ACHIEVEMENT) {
    if (!form.awardDetail.trim())     errors.awardDetail = 'Please specify the awarding body or rank achieved.';
  }

  return errors;
};

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="flex items-center gap-1.5 text-xs text-rose-500 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle size={12} />
      {message}
    </p>
  ) : null;

const CharCount = ({ current, max, warn }: { current: number; max: number; warn: number }) => {
  const over  = current > max;
  const close = current >= warn;
  return (
    <span className={`text-[10px] tabular-nums transition-colors ${over ? 'text-rose-500 font-bold' : close ? 'text-amber-500' : 'text-on-surface-variant'}`}>
      {current}/{max}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

interface CreateInsightProps {
  onSuccess?: () => void;
}

const CreateInsight = ({ onSuccess }: CreateInsightProps) => {
  const user = getStoredUser();

  const [form, setForm]           = useState<FormState>(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview]   = useState<string | null>(null);
  
  const [errors, setErrors]       = useState<FieldErrors>( {});
  const [touched, setTouched]     = useState<Partial<Record<keyof FormState | 'file', boolean>>>({});
  const [tagInput, setTagInput]   = useState('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [submitError, setSubmitError]   = useState('');
  const [expanded, setExpanded]   = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = contentRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [form.content]);

  // Handle File Selections and Clean Up Revoke Blobs
  useEffect(() => {
    if (!selectedFile) {
      setFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const set = (key: keyof FormState, value: string | string[]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (touched[key]) {
      const next = { ...form, [key]: value };
      setErrors(validate(next as FormState, selectedFile));
    }
  };

  const touch = (key: keyof FormState | 'file') => {
    setTouched(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, ...validate({ ...form }, selectedFile) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setTouched(prev => ({ ...prev, file: true }));
    setErrors(validate(form, file));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (tag && !form.tagList.includes(tag) && form.tagList.length < 5) {
      set('tagList', [...form.tagList, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) =>
    set('tagList', form.tagList.filter(t => t !== tag));

  const handleTypeChange = (type: InsightType) => {
    setForm(prev => ({ ...prev, type, location: '', eventDate: '', awardDetail: '' }));
    setSelectedFile(null);
    setErrors({});
    setTouched({});
  };

  const handleClearForm = () => {
    setForm(INITIAL_FORM);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async () => {
    setTouched({ type: true, title: true, content: true, location: true, eventDate: true, awardDetail: true, file: true });
    const fieldErrors = validate(form, selectedFile);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitStatus('loading');
    setSubmitError('');

    // ✅ TRANSITION TO FORMDATA FOR MULTIPART ROUTING (AI Scanning Compatibility)
    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('title', form.title.trim());
    formData.append('content', form.content.trim());
    
    // Append tags properly for multi-part format handling
    form.tagList.forEach(tag => formData.append('tagList[]', tag));

    if (form.type === InsightType.EVENT) {
      formData.append('location', form.location.trim());
      formData.append('eventDate', form.eventDate);
    }
    if (form.type === InsightType.ACHIEVEMENT) {
      formData.append('awardDetail', form.awardDetail.trim());
    }
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    try {
      const res = await fetch(`${BACKEND_URL}/insights/create-insight`, {
        method: 'POST',
        headers: {
          // Do NOT explicitly declare Content-Type here; browser will automatically set boundary boundaries
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data?.message)) {
          throw new Error(data.message.join(' · '));
        }
        
        // Catches Validation / AI Engine intercept messages thrown from NestJS controllers
        const statusMap: Record<number, string> = {
          400: data?.message || 'Invalid insight payload configuration.',
          401: 'Session broken. Re-authentication required.',
          403: 'Access denied for structural insights posting.',
          429: 'Rate limit boundary tripped. Wait a moment.',
          500: data?.message || 'AI moderation pipeline or core processing broke.',
        };
        throw new Error(statusMap[res.status] ?? `Validation block status (${res.status}).`);
      }

      setSubmitStatus('success');
      handleClearForm();
      setExpanded(false);
      onSuccess?.();

      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitStatus('error');
    }
  };

  const currentConfig = TYPE_CONFIG[form.type];
  const CurrentIcon   = currentConfig.icon;
  const hasErrors     = Object.keys(errors).length > 0;

  const avatarSrc = !user?.image || user.image === 'default.png'
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username ?? 'U')}&background=6366f1&color=fff&size=80`
    : user.image;

  return (
    <div className={`rounded-3xl border border-outline-variant/10 bg-surface-lowest shadow-xl transition-all duration-300 ${expanded ? 'shadow-primary/10' : ''}`}>

      {/* ── Header row ─────────────────────────────── */}
      <div className="flex gap-3 sm:gap-4 p-4 sm:p-5 pb-0">
        <div className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-surface-low flex-shrink-0 mt-1">
          <img src={avatarSrc} alt={user?.username ?? 'You'} className="w-full h-full object-cover" />
        </div>

        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 text-left bg-surface-low/50 hover:bg-surface-low rounded-2xl px-4 py-2.5 text-sm text-on-surface-variant transition-colors"
          >
            Share a scholarly insight, {user?.username ?? 'scholar'}…
          </button>
        ) : (
          <div className="flex-1 flex flex-wrap gap-1.5 pb-0 overflow-x-auto">
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const Icon    = cfg.icon;
              const active  = form.type === type;
              return (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type as InsightType)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                    active
                      ? `${cfg.activeBg} text-white shadow-md`
                      : `${cfg.bg} ${cfg.color} hover:opacity-80`
                  }`}
                >
                  <Icon size={13} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        )}

        {expanded && (
          <button
            onClick={() => { setExpanded(false); handleClearForm(); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all mt-0.5 flex-shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── Expanded form ───────────────────────────────────────────── */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 sm:pt-4 space-y-3 sm:space-y-4">

          <p className={`text-xs font-medium ${currentConfig.color} flex items-center gap-1.5`}>
            <CurrentIcon size={12} />
            {currentConfig.description}
          </p>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1 gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Title</label>
              <CharCount current={form.title.length} max={100} warn={80} />
            </div>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onBlur={() => touch('title')}
              placeholder="A compelling headline…"
              className={`w-full bg-surface-low/50 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ring-primary/20 ${
                errors.title && touched.title ? 'border-rose-500/60 bg-rose-500/5' : 'border-outline-variant/10 focus:border-primary/30'
              }`}
            />
            <FieldError message={touched.title ? errors.title : undefined} />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1 gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Content</label>
              <CharCount current={form.content.length} max={2000} warn={1800} />
            </div>
            <textarea
              ref={contentRef}
              value={form.content}
              onChange={e => set('content', e.target.value)}
              onBlur={() => touch('content')}
              placeholder="Expand your insight, share data, spark discussion…"
              rows={4}
              className={`w-full bg-surface-low/50 border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-2 ring-primary/20 resize-none overflow-hidden ${
                errors.content && touched.content ? 'border-rose-500/60 bg-rose-500/5' : 'border-outline-variant/10 focus:border-primary/30'
              }`}
            />
            <FieldError message={touched.content ? errors.content : undefined} />
          </div>

          {/* Dynamic File Attachment Node */}
          {(form.type === InsightType.IMAGE || form.type === InsightType.VIDEO) && (
            <div className="p-4 rounded-2xl bg-surface-low/40 border border-outline-variant/10 space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                Resource Attachment ({form.type})
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={form.type === InsightType.IMAGE ? 'image/*' : 'video/*'}
                className="hidden"
                id="insight-file-input"
              />

              {!selectedFile ? (
                <label
                  htmlFor="insight-file-input"
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant/30 rounded-xl p-6 cursor-pointer hover:bg-surface-low/80 hover:border-primary/40 transition-all text-on-surface-variant"
                >
                  <Paperclip size={20} className={currentConfig.color} />
                  <span className="text-xs font-semibold">Click to attach asset payload</span>
                  <span className="text-[10px] opacity-60">Max size tracking limit: 10MB</span>
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-outline-variant/10 bg-surface-dim p-2 flex items-center justify-between gap-4">
                  {form.type === InsightType.IMAGE && filePreview && (
                    <img src={filePreview} alt="Upload Preview" className="w-16 h-16 rounded-lg object-cover bg-black" />
                  )}
                  {form.type === InsightType.VIDEO && (
                    <div className="w-16 h-16 rounded-lg bg-black flex items-center justify-center text-white text-[10px] font-bold">VIDEO</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-on-surface">{selectedFile.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <FieldError message={touched.file ? errors.file : undefined} />
            </div>
          )}

          {/* EVENT fields */}
          {form.type === InsightType.EVENT && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <p className="col-span-full text-xs font-bold text-blue-500 flex items-center gap-1.5">
                <Calendar size={12} /> Event Details
              </p>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Location</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    onBlur={() => touch('location')}
                    placeholder="Building / Room / Online"
                    className={`w-full bg-surface-low/50 border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ring-blue-500/20 ${
                      errors.location && touched.location ? 'border-rose-500/60' : 'border-outline-variant/10 focus:border-blue-400/40'
                    }`}
                  />
                </div>
                <FieldError message={touched.location ? errors.location : undefined} />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.eventDate}
                  onChange={e => set('eventDate', e.target.value)}
                  onBlur={() => touch('eventDate')}
                  className={`w-full bg-surface-low/50 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ring-blue-500/20 ${
                    errors.eventDate && touched.eventDate ? 'border-rose-500/60' : 'border-outline-variant/10 focus:border-blue-400/40'
                  }`}
                />
                <FieldError message={touched.eventDate ? errors.eventDate : undefined} />
              </div>
            </div>
          )}

          {/* ACHIEVEMENT field */}
          {form.type === InsightType.ACHIEVEMENT && (
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
              <p className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <Trophy size={12} /> Achievement Detail
              </p>
              <input
                type="text"
                value={form.awardDetail}
                onChange={e => set('awardDetail', e.target.value)}
                onBlur={() => touch('awardDetail')}
                placeholder="e.g. 1st Place — Regional Robotics Championship"
                className={`w-full bg-surface-low/50 border rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 ring-amber-500/20 ${
                  errors.awardDetail && touched.awardDetail ? 'border-rose-500/60' : 'border-outline-variant/10 focus:border-amber-400/40'
                }`}
              />
              <FieldError message={touched.awardDetail ? errors.awardDetail : undefined} />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
              Tags <span className="normal-case font-normal">({form.tagList.length}/5)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.tagList.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  <Tag size={10} />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors ml-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            {form.tagList.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag, press Enter"
                  className="flex-1 bg-surface-low/50 border border-outline-variant/10 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-primary/20 focus:border-primary/30 transition-all"
                />
                <button
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Error display banner */}
          {submitStatus === 'error' && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-rose-500 mb-0.5">Content Blocked / Failed</p>
                <p className="text-xs text-rose-400 leading-relaxed">{submitError}</p>
              </div>
              <button onClick={() => setSubmitStatus('idle')} className="text-rose-400 hover:text-rose-500">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Success banner */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-green-500" />
              <p className="text-xs font-bold text-green-600">Insight cleared by AI and posted successfully!</p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant/10">
            <div className="flex items-center gap-2">
              {hasErrors && Object.values(touched).some(Boolean) && (
                <span className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle size={11} /> Please resolve form requirements.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleClearForm}
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5"
              >
                Clear
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitStatus === 'loading'}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all duration-200 ${
                  submitStatus === 'loading'
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:scale-[1.02] active:scale-[0.98]'
                } ${currentConfig.activeBg} shadow-${currentConfig.activeBg}/30`}
              >
                {submitStatus === 'loading' ? (
                  <><Loader2 size={15} className="animate-spin" /> Verifying Safety…</>
                ) : (
                  <><Send size={15} /> Post Insight</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed action strip */}
      {!expanded && (
        <div className="flex items-center gap-1.5 px-4 py-3 overflow-x-auto no-scrollbar">
          {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => { setForm(prev => ({ ...prev, type: type as InsightType })); setExpanded(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
              >
                <Icon size={12} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CreateInsight;