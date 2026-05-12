import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { LayoutDashboard, Hash, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import axios from 'axios';

const OTP_LENGTH = 6;

const Verify = () => {
  const navigate = useNavigate();
  const [rollNo, setRollNo] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!rollNo) {
      setMessage({ type: 'error', text: 'Please enter your roll number first' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const data = {
        verify_data: {
          roll_no: Number(rollNo),
          otpCode: '', // Empty OTP for resend request
        }
      };
      
      await axios.post('http://localhost:3000/users/verify', data);
      setResendCooldown(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      setMessage({ type: 'success', text: 'OTP resent successfully to your registered email' });
      inputRefs.current[0]?.focus();
    } catch (error: unknown) {
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Failed to resend OTP'
        : 'Failed to resend OTP';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Resend OTP error:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      setMessage({ type: 'error', text: 'Please enter all 6 digits of the OTP' });
      inputRefs.current[otp.findIndex(d => !d)]?.focus();
      return;
    }
    if (!rollNo) {
      setMessage({ type: 'error', text: 'Please enter your roll number' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const data = {
        verify_data: {
          roll_no: Number(rollNo),
          otpCode,
        }
      };
      
      console.log('Verifying with data:', data);
      const response = await axios.post('http://localhost:3000/users/verify', data);
      console.log('Verification successful:', response.data);
      setMessage({ type: 'success', text: 'Verification successful! Redirecting...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: unknown) {
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Verification failed'
        : 'Verification failed';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Verification error:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const otpFilled = otp.every(d => d !== '');

  return (
    <div className="min-h-screen academic-gradient flex flex-col items-center justify-center p-6 sm:p-12 lg:py-20">

      {/* Branding */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="w-16 h-16 academic-gradient rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-2xl mb-4 ring-4 ring-white/10">
          <LayoutDashboard size={32} />
        </div>
        <h1 className="text-3xl font-serif font-black text-white tracking-tight">Campus Insight</h1>
      </div>

      {/* Verify Card */}
      <Card className="w-full max-w-[440px] p-10 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-on-surface">Verify Identity</h2>
            <p className="text-on-surface-variant text-sm italic">Enter your roll number and the OTP sent to your registered email.</p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-xs font-bold text-center animate-in fade-in zoom-in-95 ${
            message.type === 'error' 
              ? 'bg-red-500/10 border border-red-500/50 text-red-500'
              : 'bg-green-500/10 border border-green-500/50 text-green-500'
          }`}>
            {message.text}
          </div>
        )}

        <form className="space-y-8" onSubmit={handleSubmit}>

          {/* Roll Number */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Roll Number</label>
            <div className="relative group">
              <Hash
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="number"
                name="roll_no"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                placeholder="e.g. 2021001"
                min={1}
                className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                required
              />
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">OTP Code</label>
            <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className={`
                    w-full aspect-square text-center text-lg font-bold rounded-xl outline-none transition-all border
                    bg-surface-low/50 border-outline-variant/10
                    focus:ring-2 ring-primary/30 focus:border-primary/40
                    ${digit ? 'text-primary border-primary/30 bg-primary/5' : 'text-on-surface'}
                  `}
                  required
                />
              ))}
            </div>

            {/* Resend */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-primary/70 hover:text-primary disabled:text-on-surface-variant/40 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw size={11} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isLoading ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!otpFilled || !rollNo || isLoading}
            className="w-full py-4 text-sm flex items-center justify-center gap-2 group shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Verify;
