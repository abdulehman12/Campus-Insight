import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { TrendingUp, Award, Clock, ArrowUpRight, Share2, MessageCircle, Trophy } from 'lucide-react';


const Home = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if authToken exists in localStorage
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // Redirect to login if no token
      navigate('/login');
    } else {
      // User is authenticated
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect via navigate
  }

  return (
    <div className="grid grid-cols-12 gap-8 py-4">
      {/* Left Column: Post Feed */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        {/* Create Post Section */}

        <Card className="p-6 border-none shadow-xl scholar-glow">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-surface-low flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <textarea
                placeholder="Initialize a new scholarly insight..."
                className="w-full bg-surface-low/30 border border-outline-variant/10 rounded-2xl p-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none resize-none min-h-[100px]"
              />
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {['Image', 'Link', 'Topic'].map((tag) => (
                    <button key={tag} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors">
                      + {tag}
                    </button>
                  ))}
                </div>
                <button className="academic-gradient text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] transition-transform">
                  Post Insight
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Featured Insight Card */}
        <Card className="relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

          <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-surface-low overflow-hidden flex-shrink-0">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="Dr. Vance" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Dr. Elena Vance</h3>
                  <p className="text-sm text-on-surface-variant">Quantum Research Dept • Head of Innovation</p>
                </div>
                <span className="text-xs text-on-surface-variant flex items-center gap-1">
                  <Clock size={12} /> 2 hours ago
                </span>
              </div>

              <p className="mt-4 text-on-surface leading-relaxed text-[1.05rem]">
                Our latest findings suggest a <span className="text-primary font-bold">40% efficiency increase</span> in grid management using localized quantum algorithms. A breakthrough for the campus sustainability initiative that could redefine urban energy consumption.
              </p>

              <div className="mt-8 flex items-center gap-8">
                <button className="flex items-center gap-2 text-sm font-semibold text-primary/80 hover:text-primary transition-colors">
                  <ArrowUpRight size={18} />
                  <span>2.4k Insights</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
                  <MessageCircle size={18} />
                  <span>128 Comments</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors ml-auto">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Club Update Card */}
        <Card className="border-none">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center flex-shrink-0">
              <TrendingUp size={28} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Campus Engineering Club</h3>
                  <p className="text-sm text-on-surface-variant">Student Organization • 1,240 members</p>
                </div>
                <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Event
                </span>
              </div>

              <p className="mt-4 text-on-surface leading-relaxed">
                Registration is now officially open for our <span className="italic font-medium underline decoration-tertiary/30">Annual Spring Robotics Showcase</span>! Witness the future of automation designed by our very own students. Limited attendee slots available.
              </p>

              <div className="mt-6 flex gap-4">
                <button className="academic-gradient text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  Register Now
                </button>
                <button className="bg-surface-lowest text-on-surface-variant px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-surface-low transition-all">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Widgets */}
      <div className="col-span-12 lg:col-span-4 space-y-8">
        {/* Insight Score Card */}
        <Card variant="low" className="academic-gradient text-white border-none shadow-2xl shadow-primary/30">
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">My Insight Score</h3>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-5xl font-serif font-black">75%</span>
            <span className="text-sm mb-2 opacity-80">of weekly goal</span>
          </div>
          <div className="mt-6 w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
            <div className="bg-on-primary w-[75%] h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          </div>
          <p className="mt-6 text-sm opacity-90 leading-relaxed">
            You are ahead of 85% of your peers in the Political Science department. Keep curating!
          </p>
        </Card>

        {/* Trending Academic Topics */}
        <div className="space-y-4">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
            Trending Insights
            <TrendingUp size={14} />
          </h3>
          <Card className="p-2 space-y-1">
            {[
              { label: 'Sustainable Lab Practices', count: '2.4k insights' },
              { label: 'AI in Humanities', count: '1.8k insights' },
              { label: 'Chess State Finals', count: '1.2k insights' }
            ].map((topic, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-surface-lowest transition-all text-left group">
                <div>
                  <p className="font-serif font-bold text-on-surface group-hover:text-primary transition-colors">{topic.label}</p>
                  <p className="text-xs text-on-surface-variant">{topic.count}</p>
                </div>
                <ArrowUpRight size={18} className="text-on-surface-variant group-hover:text-primary transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            ))}
          </Card>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-4">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-on-surface-variant flex items-center justify-between">
            Campus Laurels
            <Award size={14} />
          </h3>
          <Card className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Trophy size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Chess Club Champions</p>
                <p className="text-xs text-on-surface-variant">Defeated State University</p>
                <p className="mt-2 text-[10px] text-primary font-black uppercase tracking-tighter">MVP: Sarah Jenkins</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary flex-shrink-0">
                < Award size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Winter League Leadership</p>
                <p className="text-xs text-on-surface-variant">Top-tier academic engagement</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
