import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout.tsx';
import Home from './pages/feed/Home.tsx';
import Profile from './pages/profile/Profile.tsx';
import Settings from './pages/utility/Settings.tsx';
import Help from './pages/utility/Help.tsx';
import Logout from './pages/auth/Logout.tsx';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register.tsx';
import Example from './pages/profile/Example.tsx';
import Verify from './pages/auth/Verify.tsx';
// Placeholder components for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[60vh] text-on-surface-variant italic font-serif text-2xl">
    {title} - Coming Soon
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Application Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/clubs" element={<Placeholder title="Clubs Society" />} />
          <Route path="/sports" element={<Placeholder title="Athletic Insights" />} />
          <Route path="/events" element={<Placeholder title="Campus Events" />} />
          <Route path="/announcements" element={<Placeholder title="Bulletin Board" />} />
          <Route path="/messaging" element={<Placeholder title="Academic Exchange" />} />
          <Route path="/achievements" element={<Placeholder title="Scholastic Honors" />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/create-post" element={<Placeholder title="New Insight" />} />
          <Route path="/example" element={<Example />} />
        </Route>

        {/* Standalone Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/verify-otp" element={<Verify/>} />
      </Routes>
    </Router>
  );
}

export default App;
