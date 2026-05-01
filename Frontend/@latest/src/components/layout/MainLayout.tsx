import { Outlet } from 'react-router-dom';
import Header from './Header.tsx';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Fixed Header */}
      <header className="fixed top-0 right-0 left-0 z-50">
        <Header />
      </header>

      {/* Main Content Area - Now full width with top padding */}
      <main className="pt-24 px-6 md:px-12 pb-12 w-full">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
