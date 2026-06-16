import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { Mail, Lock, LayoutDashboard, ArrowRight } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const data = {
        user: {
          email,
          password,
        }
      };
      
      console.log('Logging in with email:', email);
      const response = await axios.post('http://localhost:3000/users/login', data);
      
      // Extract user object and token from response
      const userData = response.data.user;
      const token = userData?.token;
      
      if (!userData || !token) {
        setMessage({ type: 'error', text: 'Invalid response from server' });
        console.error('Invalid response structure:', response.data);
        return;
      }
      
      // Store JWT token in localStorage
      localStorage.setItem('authToken', token);
      
      // Store complete user information
      localStorage.setItem('user', JSON.stringify({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        mobile_no: userData.mobile_no,
        roll_no: userData.roll_no,
        unit: userData.unit,
        bio: userData.bio,
        image: userData.image,
        isVerified: userData.isVerified,
        role: userData.role,
      }));
      
      console.log('Login successful:', {
        user: userData.username,
        email: userData.email,
        token: token.substring(0, 20) + '...'
      });
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      
      // Redirect to home page after a short delay
      setTimeout(() => navigate('/'), 1500);
    } catch (error: unknown) {
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.error || 'Login failed'
        : 'Login failed';
      setMessage({ type: 'error', text: errorMsg });
      console.error('Login error:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen academic-gradient flex flex-col items-center justify-center p-6 sm:p-12">
      {/* Branding Above Card */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="w-20 h-20 academic-gradient rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl mb-6 ring-8 ring-white/10">
          <LayoutDashboard size={40} />
        </div>
        <h1 className="text-4xl font-serif font-black text-white tracking-tight drop-shadow-sm">Campus Insight</h1>
        <p className="text-white/70 font-medium tracking-widest uppercase text-[10px] mt-2">Institutional Access Portal</p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-[450px] p-10 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-on-surface">Welcome Back</h2>
          <p className="text-on-surface-variant text-sm italic">Initialize your academic session to continue curation.</p>
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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-primary ml-1">Institutional Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="email" 
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="university@domain.edu"
                className="w-full bg-surface-low/50 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 focus:bg-surface-lowest"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-primary ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="password" 
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-low/50 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 focus:bg-surface-lowest"
                required
              />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-sm text-on-surface-variant">
            Forgot your password?{' '}
            <Link to="/forgot-password" className="text-primary font-bold hover:underline underline-offset-4">Reset it</Link>
          </p>
        </div>

          <Button type="submit" disabled={isLoading} className="w-full py-4 text-base flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Accessing Insights...' : 'Access Insights'}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-sm text-on-surface-variant">
            New to the community?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">Register Scholastic Identity</Link>
          </p>
        </div>
      </Card>

      {/* Footer Info */}
      <div className="mt-12 text-center text-white/40 text-[9px] uppercase tracking-[0.3em]">
        Scholarly Security Protocol • Campus Insight v4.2.0
      </div>
    </div>
  );
};

export default Login;
