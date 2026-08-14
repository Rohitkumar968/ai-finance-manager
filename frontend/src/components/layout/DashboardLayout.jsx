import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = () => {
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-black">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fadeIn">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute top-60 right-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"></div>
        </div>
        <Outlet />
        </main>
        <Footer/>
      </div>
    </div>
  );
};

export default DashboardLayout;
