import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Payments from './pages/Payments';
import Fees from './pages/Fees';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen print:ml-0 print:p-0 print:overflow-visible">
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