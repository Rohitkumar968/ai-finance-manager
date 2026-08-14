import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, toggleSidebar } from '../../features/ui/uiSlice';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../ui/NotificationBell';
import {
  Search,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const theme = useSelector((state) => state.ui.theme);
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/70 px-4 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/70 lg:px-8">

      {/* Mobile Sidebar Button */}
      <button
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="flex flex-1 items-center justify-between gap-4">

        {/* Search */}
        <div className="hidden w-full max-w-md items-center md:flex">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900/80"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="ml-auto flex items-center gap-3">

          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={18} />
            ) : (
              <Sun size={18} />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile */}
          <div className="flex items-center gap-2">

            {/* Name + Email */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-none">
                {user?.name || 'User'}
              </p>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {user?.email || ''}
              </p>
            </div>

            {/* Profile Picture */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary-600 text-sm font-bold text-white shadow-md transition-transform hover:scale-105"
              title="Profile Settings"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'Profile'}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </button>

          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-600 hover:shadow-lg"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;