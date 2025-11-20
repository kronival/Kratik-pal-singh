
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, User } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    const success = login(username, password);
    if (!success) {
        setError('Invalid credentials. Try admin/123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-700 p-8 text-center">
            <div className="inline-flex p-3 bg-white/20 rounded-xl mb-4 backdrop-blur-sm">
                <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">EduFee Pro</h1>
            <p className="text-blue-100 mt-2">Secure School Management</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white"
                        placeholder="Enter your username"
                        autoFocus
                    />
                </div>
             </div>

             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-white"
                        placeholder="Enter your password"
                    />
                </div>
             </div>

             {error && (
                 <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center justify-center border border-red-100 dark:border-red-800">
                     {error}
                 </div>
             )}

             <button
                type="submit"
                className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.99]"
             >
                 Sign In
             </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
             <p className="text-xs text-center text-gray-400 dark:text-gray-500 uppercase font-semibold mb-3">Default Credentials</p>
             <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                 <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded border border-gray-100 dark:border-slate-600 text-center">
                     <span className="font-bold text-gray-700 dark:text-gray-300">admin</span> / 123
                 </div>
                 <div className="bg-gray-50 dark:bg-slate-700 p-2 rounded border border-gray-100 dark:border-slate-600 text-center">
                     <span className="font-bold text-gray-700 dark:text-gray-300">acct</span> / 123
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
