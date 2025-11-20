
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  FileText, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, theme, toggleTheme } = useApp();
  const location = useLocation();

  const isActive = (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
  };

  const navItemClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}
  `;

  return (
    <div className="w-64 h-screen bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col fixed left-0 top-0 no-print transition-colors duration-200">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700">
        <h1 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">E</span>
          EduFee Pro
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">Session 2025-26</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-4">Menu</p>
          
          <Link to="/" className={navItemClass('/')}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>

          {(user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT' || user?.role === 'TEACHER') && (
            <Link to="/students" className={navItemClass('/students')}>
              <Users size={20} />
              Students
            </Link>
          )}

          {(user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT') && (
            <Link to="/payments" className={navItemClass('/payments')}>
              <CreditCard size={20} />
              Payments
            </Link>
          )}

          {(user?.role === 'ADMIN') && (
            <Link to="/fees" className={navItemClass('/fees')}>
              <Settings size={20} />
              Admin Config
            </Link>
          )}

          <Link to="/reports" className={navItemClass('/reports')}>
            <FileText size={20} />
            Reports
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between px-4 py-2">
           <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Theme</span>
           <button 
             onClick={toggleTheme}
             className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
             aria-label="Toggle Theme"
           >
             {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
           </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-sm border-2 border-indigo-50 dark:border-indigo-900">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
