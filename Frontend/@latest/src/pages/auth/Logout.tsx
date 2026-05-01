import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { LogOut, Home, Key } from 'lucide-react';

const Logout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen academic-gradient flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-12 text-center space-y-8 shadow-2xl">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-4">
          <LogOut size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-black text-on-surface tracking-tight">Session Concluded</h1>
          <p className="text-on-surface-variant italic">
            You are about to terminate your current academic session. All active curation and insights will be preserved.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={() => navigate('/')}
            className="w-full py-4 text-lg"
          >
            Confirm Termination
          </Button>
          
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Stay Active
            </Button>
            <Button 
              variant="ghost" 
              className="flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Key size={18} />
              Switch ID
            </Button>
          </div>
        </div>

        <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-[0.2em] pt-8">
          Campus Insight Security Protocol v4.2
        </p>
      </Card>
    </div>
  );
};

export default Logout;
