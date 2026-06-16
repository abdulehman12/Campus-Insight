import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card.tsx';
import Button from '../../components/ui/Button.tsx';
import { User, Mail, Lock, LayoutDashboard, Hash, Phone, Building2, ArrowRight, Camera, ImagePlus, Calendar } from 'lucide-react';
import axios from 'axios';



const units = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration',
  'Mathematics',
  'Physics',
  'Chemistry',
];

const Register = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const form = e.currentTarget;

    // Use FormData to support file upload
    const formData = new FormData();
    formData.append('username', (form.elements.namedItem('username') as HTMLInputElement).value);
    formData.append('email', (form.elements.namedItem('email') as HTMLInputElement).value);
    formData.append('mobile_no', (form.elements.namedItem('mobile_no') as HTMLInputElement).value);
    formData.append('roll_no', (form.elements.namedItem('roll_no') as HTMLInputElement).value);
    formData.append('unit', (form.elements.namedItem('unit') as HTMLSelectElement).value);
    formData.append('start_date', (form.elements.namedItem('start_date') as HTMLInputElement).value);
    formData.append('end_date', (form.elements.namedItem('end_date') as HTMLInputElement).value);
    formData.append('password', (form.elements.namedItem('password') as HTMLInputElement).value);
    if (imageFile) formData.append('image', imageFile);

    console.log('Registering with image:', imageFile?.name);
    // TODO: call your API here, e.g. POST /api/auth/register with formData
    try {
      // Point this to your NestJS backend URL
      console.log('Submitting registration form with data:', {
        username: formData.get('username'),
        email: formData.get('email'),
        mobile_no: formData.get('mobile_no'),
        roll_no: formData.get('roll_no'),
        unit: formData.get('unit'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        password: formData.get('password'),
        image: imageFile?.name,
      });
      const response = await axios.post('http://localhost:3000/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.data);
      navigate('/verify-otp');
    } catch (error: unknown) {
      // Handles errors from your NestJS HttpException
      const errorMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Registration failed'
        : 'Registration failed';
      setMessage(errorMsg);
      console.error('Registration error:', errorMsg);
    }

  };

  return (

    <div className="min-h-screen academic-gradient flex flex-col items-center justify-center p-6 sm:p-12 lg:py-20">
      {/* Branding */}
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="w-16 h-16 academic-gradient rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-2xl mb-4 ring-4 ring-white/10">
          <LayoutDashboard size={32} />
        </div>
        <h1 className="text-3xl font-serif font-black text-white tracking-tight">Campus Insight</h1>
      </div>

      {/* Register Card */}
      <Card className="w-full max-w-[650px] p-10 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-700 delay-200">
        {/* Error/Success Message */}
        {message && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold text-center animate-in fade-in zoom-in-95">
            {message}
          </div>
        )}

        <div className="space-y-2 mb-10 text-center">
          <h2 className="text-2xl font-bold text-on-surface">Create Your Account</h2>
          <p className="text-on-surface-variant text-sm italic">Join the intellectual circle and begin your curation journey.</p>
        </div>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group w-24 h-24 rounded-full bg-surface-low/50 border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all overflow-hidden focus:outline-none focus:ring-2 ring-primary/20"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <ImagePlus size={22} className="text-on-surface-variant/50 group-hover:text-primary transition-colors" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/40 group-hover:text-primary/60 transition-colors">Photo</span>
              </div>
            )}
            {/* Overlay on hover when image is set */}
            {imagePreview && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-[10px] text-on-surface-variant/50 mt-2 tracking-wide">
            {imageFile ? imageFile.name : 'Upload profile photo (optional)'}
          </p>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
          {/* Left Column: Personal Identity */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 px-1">Personal Identity</p>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="username"
                  type="text"
                  placeholder="alex_rivers"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="alex@university.edu"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            {/* Mobile No */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Mobile Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="mobile_no"
                  type="tel"
                  placeholder="+92 300 1234567"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column: Academic Info */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2 px-1">Academic Info</p>

            {/* Roll No */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Roll Number</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="roll_no"
                  type="number"
                  placeholder="e.g. 2021001"
                  min={1}
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            {/* Unit / Department */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Department / Unit</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <select
                  name="unit"
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10 appearance-none cursor-pointer"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Select Department</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
                  {/*start_date*/}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">Start Year</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="start_date"
                  type="number"
                  placeholder="e.g. 2020"
                  min={1900}
                  max={2100}
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>
            {/* End Year */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 ml-1">End Year</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input
                  name="end_date"
                  type="number"
                  placeholder="e.g. 2024"
                  min={1900}
                  max={2100}
                  className="w-full bg-surface-low/50 py-3.5 pl-12 pr-4 rounded-xl outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-sm border border-outline-variant/10"
                  required
                />
              </div>
            </div>

            {/* Submit — pushed to bottom */}
            <div className="pt-[4.5rem]">
              <Button type="submit" className="w-full py-4 text-sm flex items-center justify-center gap-2 group shadow-xl">
                Create Account
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
