import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../pages/admin/admin_dashboard/AdminDashboard';

const ProtectedAdminRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    
    // If no token exists, redirect to admin login
    if (!adminToken) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  // Check token on render
  const adminToken = localStorage.getItem('adminToken');
  
  // If token exists, show the dashboard
  if (adminToken) {
    return <AdminDashboard />;
  }

  // While checking or token doesn't exist, return null (effect will redirect)
  return null;
};

export default ProtectedAdminRoute;
