
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Fees from './pages/Fees';
import Reports from './pages/Reports';
import StudentProfile from './pages/StudentProfile';
import './services/firebase'; // Initialize Firebase
import { Menu } from 'lucide-react';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto h-screen w-full print:ml-0 print:p-0 print:overflow-visible">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg text-gray-800 dark:text-white">EduFee Pro</span>
        </div>
        
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useApp();
  
  return (
    <Routes>
       <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
       
       <Route path="/" element={
         <ProtectedRoute>
           <Dashboard />
         </ProtectedRoute>
       } />
       
       <Route path="/students" element={
         <ProtectedRoute>
           <Students />
         </ProtectedRoute>
       } />

       <Route path="/students/:id" element={
         <ProtectedRoute>
           <StudentProfile />
         </ProtectedRoute>
       } />

       <Route path="/payments" element={
         <ProtectedRoute>
           <Payments />
         </ProtectedRoute>
       } />

       <Route path="/fees" element={
         <ProtectedRoute>
           <Fees />
         </ProtectedRoute>
       } />

       <Route path="/reports" element={
         <ProtectedRoute>
           <Reports />
         </ProtectedRoute>
       } />
    </Routes>
  );
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
