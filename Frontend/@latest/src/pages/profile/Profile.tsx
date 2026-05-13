import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Globe, 
  MapPin, 
  BookOpen, 
  Award, 
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface UserData {
  id: string;
  email: string;
  username: string;
  mobile_no: string;
  roll_no: string;
  unit: string;
  bio: string;
  image: string;
  isVerified: boolean;
  role: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, []);

  if (!user) {
    return <div className="p-8">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 py-4">
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden border-none p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full -mr-32 -mt-32 transition-opacity duration-700" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-10">
          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-surface-lowest transition-all">
            <img 
              src={user.image || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"} 
              alt={user.username} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-serif font-black text-on-surface tracking-tight">{user.username}</h1>
            <p className="text-xl text-primary font-medium mt-1">{user.roll_no}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6">
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <MapPin size={16} className="text-primary" />
                {user.unit}
              </span>
              <span className="flex items-center gap-2 text-sm text-on-surface-variant">
                <Globe size={16} className="text-primary" />
                {user.email}
              </span>
              {user.isVerified && (
                <span className="flex items-center gap-2 text-sm text-on-surface-variant font-bold text-tertiary">
                  <Award size={16} />
                  Verified
                </span>
              )}
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
              {user.bio || "No bio added yet."}
            </p>
            
            <h3 className="text-lg font-bold mt-8 mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <p className="text-on-surface-variant"><span className="font-semibold">Email:</span> {user.email}</p>
              <p className="text-on-surface-variant"><span className="font-semibold">Phone:</span> {user.mobile_no || "Not provided"}</p>
              <p className="text-on-surface-variant"><span className="font-semibold">Roll No:</span> {user.roll_no}</p>
            </div>
          </Card>

          <Card variant="low" className="border-none bg-tertiary/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-tertiary">
                <TrendingUp size={20} />
                Profile Info
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">User ID</span>
                    <span className="font-bold text-sm">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Role</span>
                    <span className="font-bold text-lg capitalize">{user.role}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface-variant">Status</span>
                    <span className={`font-bold text-sm px-2 py-1 rounded ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                </div>
            </div>
          </Card>
        </div>

        {/* Recent Insights */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <h2 className="text-2xl font-serif font-black px-4">Recent Insights</h2>
          
          <Card className="border-none shadow-sm">
            <div className="text-center py-8">
              <p className="text-on-surface-variant">Recent insights will appear here</p>
              <p className="text-sm text-on-surface-variant mt-2">Share your first insight to get started</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
