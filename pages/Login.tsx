import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Shield, User, School, Wallet } from 'lucide-react';

const Login = () => {
  const { login } = useApp();
  const [name, setName] = useState('');

  const handleLogin = (role: UserRole) => {
    if (!name) {
      alert('Please enter a name');
      return;
    }
    login(role, name);
  };

  const RoleButton = ({ role, icon: Icon, label, color }: { role: UserRole, icon: any, label: string, color: string }) => (
    <button
      onClick={() => handleLogin(role)}
      className={`flex flex-col items-center justify-center p-6 bg-white border-2 border-transparent rounded-xl shadow-sm hover:shadow-md hover:border-${color}-500 transition-all duration-200 w-full`}
    >
      <div className={`w-12 h-12 bg-${color}-100 text-${color}-600 rounded-full flex items-center justify-center mb-3`}>
        <Icon size={24} />
      </div>
      <span className="font-semibold text-gray-800">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">EduFee Pro</h1>
          <p className="text-gray-600">Secure Fees Management System</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter your name to continue</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Select Role</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <RoleButton role="ADMIN" icon={Shield} label="Admin" color="blue" />
            <RoleButton role="ACCOUNTANT" icon={Wallet} label="Accountant" color="emerald" />
            <RoleButton role="TEACHER" icon={School} label="Teacher" color="orange" />
            <RoleButton role="PARENT" icon={User} label="Parent" color="purple" />
          </div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          &copy; 2025 EduFee Management System
        </p>
      </div>
    </div>
  );
};

export default Login;