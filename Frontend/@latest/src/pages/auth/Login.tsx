import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { Mail, Lock, LayoutDashboard, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

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

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-primary ml-1">Institutional Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="email" 
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
                placeholder="••••••••"
                className="w-full bg-surface-low/50 py-4 pl-12 pr-4 rounded-2xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 focus:bg-surface-lowest"
                required
              />
            </div>
          </div>

          <div className="flex justify-end p-1">
            <button type="button" className="text-xs font-bold text-primary hover:underline underline-offset-4">Forgot Credentials?</button>
          </div>

          <Button type="submit" className="w-full py-4 text-base flex items-center justify-center gap-2 group">
            Access Insights
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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
