import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Using hash router in App
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  FileText, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItemClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
    ${isActive(path) 
      ? 'bg-blue-600 text-white shadow-md' 
      : 'text-gray-600 hover:bg-gray-100'}
  `;

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 no-print">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-blue-900 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">E</span>
          EduFee Pro
        </h1>
        <p className="text-xs text-gray-500 mt-1 ml-1">Session 2025-26</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">Menu</p>
          
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
              Fee Config
            </Link>
          )}

          <Link to="/reports" className={navItemClass('/reports')}>
            <FileText size={20} />
            Reports
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;