import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { 
  MessageCircle, 
  Search, 
  BookOpen, 
  Clock, 
  ArrowUpRight,
  HelpCircle,
  FileText
} from 'lucide-react';

const Help = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-4 px-4 py-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        <h1 className="text-4xl font-serif font-black text-on-surface tracking-tight">How can we elevate your experience?</h1>
        <p className="text-on-surface-variant max-w-xl mx-auto italic">
          Our dedicated academic concierge team is here to ensure your scholarship remains unhindered and your curation perfect.
        </p>
        
        <div className="max-w-xl mx-auto relative group mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search documentation, peer guides, and institutional resources..." 
            className="w-full bg-white py-4 pl-14 pr-4 rounded-[2rem] outline-none shadow-xl shadow-primary/5 focus:ring-2 ring-primary/20 transition-all font-medium text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Support Options */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold px-2 flex items-center gap-3 text-primary">
            <MessageCircle size={22} />
            Submit an Inquiry
          </h2>
          
          <Card className="space-y-6 border-none">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold text-tertiary">
                <Clock size={14} />
                Expected response time: Under 2 academic hours.
              </div>
              <textarea 
                placeholder="Describe your inquiry with scholarly precision..."
                className="w-full min-h-[160px] bg-surface-low rounded-2xl p-6 outline-none focus:ring-2 ring-primary/10 transition-all text-sm resize-none"
              />
              <Button className="w-full py-4">Transmit Inquiry</Button>
            </div>
          </Card>

          <Card variant="low" className="border-none bg-primary/5 p-8 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                <HelpCircle size={28} />
              </div>
              <div>
                <p className="font-serif font-bold">Direct Concierge</p>
                <p className="text-xs text-on-surface-variant max-w-[180px]">Available for academic consultation and platform navigation.</p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Card>
        </div>

        {/* Knowledge Base */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold px-2 flex items-center gap-3 text-primary">
            <BookOpen size={22} />
            Frequently Referenced
          </h2>

          <div className="space-y-4">
            {[
              { title: 'Privacy & Data Ethics', sub: 'How we curate your academic footprint' },
              { title: 'Mastering the Feed', sub: 'Optimizing your algorithmic curation' },
              { title: 'Peer Collaboration', sub: 'Rules for scholarly engagement' },
              { title: 'Institution Syncing', sub: 'Connecting your academic credentials' }
            ].map((article, i) => (
              <Card key={i} className="group border-none hover:bg-white hover:shadow-lg transition-all cursor-pointer py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText size={18} className="text-on-surface-variant group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-sm font-bold font-serif">{article.title}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{article.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>

          <div className="pt-4 px-2">
            <p className="text-xs text-on-surface-variant italic">
              Can't find what you're looking for? Our documentation is curated by students, for students. 
              <span className="text-primary font-bold ml-1 cursor-pointer hover:underline">View Full Archive</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal utility component for the icon
const ChevronRight = ({ size, className }: { size: number, className: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default Help;
