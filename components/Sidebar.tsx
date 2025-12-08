
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
  Sun,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 
        flex flex-col transition-transform duration-300 ease-in-out no-print
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">E</span>
              EduFee Pro
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">Session 2025-26</p>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 dark:text-gray-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-4">Menu</p>
            
            <Link to="/" className={navItemClass('/')} onClick={() => window.innerWidth < 768 && onClose()}>
              <LayoutDashboard size={20} />
              Dashboard
            </Link>

            {(user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT' || user?.role === 'TEACHER') && (
              <Link to="/students" className={navItemClass('/students')} onClick={() => window.innerWidth < 768 && onClose()}>
                <Users size={20} />
                Students
              </Link>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT') && (
              <Link to="/payments" className={navItemClass('/payments')} onClick={() => window.innerWidth < 768 && onClose()}>
                <CreditCard size={20} />
                Payments
              </Link>
            )}

            {(user?.role === 'ADMIN') && (
              <Link to="/fees" className={navItemClass('/fees')} onClick={() => window.innerWidth < 768 && onClose()}>
                <Settings size={20} />
                Admin Config
              </Link>
            )}

            <Link to="/reports" className={navItemClass('/reports')} onClick={() => window.innerWidth < 768 && onClose()}>
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
    </>
  );
};

export default Sidebar;
