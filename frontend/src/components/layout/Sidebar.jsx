import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../features/ui/uiSlice';
import {
  LayoutDashboard,
  CreditCard,
  Target,
  Trophy,
  Bot,
  User,
  Shield,
  Users,
  Settings,
  Receipt,
  BarChart3,
  X,
} from 'lucide-react';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: <CreditCard size={18} />,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: <BarChart3 size={18} />,
  },
  {
    to: '/budgets',
    label: 'Budgets',
    icon: <Target size={18} />,
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: <Trophy size={18} />,
  },
  {
    to: '/ai-advisor',
    label: 'AI Advisor',
    icon: <Bot size={18} />,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: <User size={18} />,
  },
];

const adminNavItems = [
  {
    to: '/admin',
    label: 'Admin Dashboard',
    icon: <Shield size={18} />,
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: <Users size={18} />,
  },
  {
    to: '/admin/transactions',
    label: 'All Transactions',
    icon: <Receipt size={18} />,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: <BarChart3 size={18} />,
  },
  {
    to: '/admin/settings',
    label: 'System Settings',
    icon: <Settings size={18} />,
  },
];

const Sidebar = ({ open }) => {
  const dispatch = useDispatch();

  const isAdmin = useSelector(
    (state) => state.auth.user?.role === 'admin'
  );

  const closeSidebar = () => {
    dispatch(toggleSidebar());
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64
          transform bg-white/90 dark:bg-gray-950/90
          backdrop-blur-xl border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-800">
          
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg">
            ₹
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-lg truncate">
              FinanceAI
            </h2>
            <p className="text-xs text-gray-500 truncate">
              Smart Money Manager
            </p>
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1 px-3 pb-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <div className="mt-4 mb-1 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Admin
              </div>

              {adminNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;