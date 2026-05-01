import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Globe, 
  MapPin, 
  BookOpen, 
  Award, 
  TrendingUp, 
  ArrowRight,
  Clock
} from 'lucide-react';

const Profile = () => {
  return (
    <div className="space-y-8 py-4">
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden border-none p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full -mr-32 -mt-32 transition-opacity duration-700" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-surface-lowest transition-all">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200" 
              alt="Alex Rivers" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-serif font-black text-on-surface tracking-tight">Alex Rivers</h1>
            <p className="text-xl text-primary font-medium mt-1">Senior, Political Science</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <MapPin size={16} className="text-primary" />
                East Campus, Hall 7
              </span>
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Globe size={16} className="text-primary" />
                rivers-insights.edu
              </span>
              <span className="flex items-center gap-2 text-sm text-on-surface-variant font-bold text-tertiary">
                <Award size={16} />
                Honors Society
              </span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button variant="secondary">Edit Profile</Button>
            <Button>Share Insight</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-8">
        {/* About & Interests */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <Card className="border-none">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
              <BookOpen size={20} />
              About
            </h3>
            <p className="text-on-surface-variant leading-relaxed italic">
              "Passionate about the intersection of digital ethics and public policy. Currently researching how social algorithms shape campus discourse. Aspiring policy analyst and occasional debater."
            </p>
            
            <h3 className="text-lg font-bold mt-8 mb-4">Top Interests</h3>
            <div className="flex flex-wrap gap-2">
              {['Digital Ethics', 'Public Policy', 'Social Algorithms', 'Debate', 'Political Phil'].map((interest) => (
                <span key={interest} className="px-3 py-1 bg-surface-low/80 rounded-xl text-xs font-semibold text-on-surface-variant border border-outline-variant/10">
                  {interest}
                </span>
              ))}
            </div>
          </Card>

          <Card variant="low" className="border-none bg-tertiary/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-tertiary">
                <TrendingUp size={20} />
                Scholastic Stats
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Curated Insights</span>
                    <span className="font-bold text-lg">142</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Peer Mentions</span>
                    <span className="font-bold text-lg">856</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Research Citations</span>
                    <span className="font-bold text-lg">24</span>
                </div>
            </div>
          </Card>
        </div>

        {/* Recent Insights */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-serif font-black px-4">Recent Insights</h2>
          
          {[
            {
              title: "The paradox of silent libraries: Why deep work is becoming a campus luxury",
              excerpt: "As campus study spaces become increasingly integrated with social hubs, the traditional quiet zone is under threat. Here’s why we need to fight for cognitive silence...",
              date: "3 days ago",
              engagement: "456 peer insights"
            },
            {
              title: "Debate Night Recap: Public Policy in the Age of AI",
              excerpt: "Last night's session was intense. We tackled the ethics of automated welfare distribution. The consensus? Human oversight isn't just a safety net; it's a moral requirement.",
              date: "1 week ago",
              engagement: "1.2k insights"
            }
          ].map((insight, index) => (
            <Card key={index} className="group hover:scale-[1.01] transition-all cursor-pointer border-none shadow-sm hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-2">
                    <Clock size={12} />
                    {insight.date}
                  </div>
                  <h3 className="text-xl font-serif font-bold group-hover:text-primary transition-colors leading-tight">
                    {insight.title}
                  </h3>
                  <p className="mt-4 text-on-surface-variant line-clamp-2">
                    {insight.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-xs font-bold text-primary">
                    <span>{insight.engagement}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <button className="w-full py-4 text-on-surface-variant hover:text-primary font-bold text-sm transition-colors border-2 border-dashed border-outline-variant/20 rounded-3xl">
            View Archive of Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
