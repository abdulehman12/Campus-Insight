import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { User, Mail, Lock, LayoutDashboard, GraduationCap, Calendar, ArrowRight, BookOpen, Clock } from 'lucide-react';

const degreePaths = [
  'Political Science',
  'Computer Science',
  'Business Administration',
  'Quantum Physics',
  'Classical Literature',
  'Environmental Engineering',
  'Global Innovation',
  'Medical Sciences'
];

const startYears = Array.from({ length: 11 }, (_, i) => 2020 + i);
const endYears = Array.from({ length: 11 }, (_, i) => 2024 + i);
const semesters = [
  'Semester 1 (Freshman)',
  'Semester 2 (Freshman)',
  'Semester 3 (Sophomore)',
  'Semester 4 (Sophomore)',
  'Semester 5 (Junior)',
  'Semester 6 (Junior)',
  'Semester 7 (Senior)',
  'Semester 8 (Senior)',
  'Postgraduate Studies'
];

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen academic-gradient flex flex-col items-center justify-center p-6 sm:p-12 lg:py-20">
      {/* Branding Above Card */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="w-16 h-16 academic-gradient rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-2xl mb-4 ring-4 ring-white/10">
          <LayoutDashboard size={32} />
        </div>
        <h1 className="text-3xl font-serif font-black text-white tracking-tight">Campus Insight</h1>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-[650px] p-10 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">
        <div className="space-y-2 mb-10 text-center">
          <h2 className="text-2xl font-bold text-on-surface">Register Scholastic Identity</h2>
          <p className="text-on-surface-variant text-sm italic">Join the intellectual circle and begin your curation journey.</p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
          {/* Left Column: Personal Identity */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 px-1">Personal Identity</p>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Alex Rivers"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Institutional Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="alex.rivers@edu.io"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Security Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Administrative Admission Date</label>
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors z-10 pointer-events-none" size={18} />
                    <input 
                        type="date" 
                        className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 appearance-none cursor-pointer relative"
                        required
                    />
                </div>
            </div>
          </div>

          {/* Right Column: Academic Lifecycle */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 px-1">Academic Lifecycle</p>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Degree Path</label>
              <div className="relative group">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <select 
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled selected>Select Scholastic Path</option>
                  {degreePaths.map(path => <option key={path} value={path}>{path}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Start Year</label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={14} />
                        <select 
                            className="w-full bg-surface-low/50 py-3 pl-10 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 appearance-none"
                            required
                        >
                            <option value="">Start</option>
                            {startYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">End Year</label>
                    <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={14} />
                        <select 
                            className="w-full bg-surface-low/50 py-3 pl-10 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 appearance-none"
                            required
                        >
                            <option value="">End</option>
                            {endYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Current Standing (Class/Semester)</label>
              <div className="relative group">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <select 
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled selected>Select Current Standing</option>
                  {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-4 text-sm flex items-center justify-center gap-2 group shadow-xl">
                Register Identity
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-outline-variant/10 text-center">
          <p className="text-sm text-on-surface-variant">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">Access Session</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
