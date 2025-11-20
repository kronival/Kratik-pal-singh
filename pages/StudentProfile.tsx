
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar, CreditCard, AlertCircle, History, Edit2 } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, payments } = useApp();

  const student = useMemo(() => students.find(s => s.id === id), [students, id]);
  
  const history = useMemo(() => 
    payments.filter(p => p.studentId === id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [payments, id]);

  if (!student) {
    return <div className="p-12 text-center text-gray-500 dark:text-gray-400">Student not found</div>;
  }

  const prevDue = student.previousDues.reduce((sum, d) => sum + Number(d.amount), 0);
  const currentDue = student.currentYearFee - student.currentYearPaid;
  const totalDue = prevDue + currentDue;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 font-medium">
        <ArrowLeft size={20} /> Back to Students
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800"></div>
        <div className="px-8 pb-8 relative">
           <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-800 absolute -top-12 flex items-center justify-center shadow-md text-3xl font-bold text-blue-600 dark:text-blue-400">
              {student.name.charAt(0)}
           </div>
           
           <div className="pt-16 flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
                 <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-1">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-sm font-medium text-gray-800 dark:text-gray-200">Class {student.className}</span>
                    <span>•</span>
                    <span>Adm: {student.admissionNumber}</span>
                 </div>
              </div>
              
              <div className="flex gap-3">
                  <button 
                     onClick={() => navigate('/payments', { state: { studentId: student.id, className: student.className } })} 
                     className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <CreditCard size={18} /> Pay Fees
                  </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
              <div>
                 <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">Parents</p>
                 <p className="font-medium text-gray-900 dark:text-white">F: {student.fatherName}</p>
                 <p className="font-medium text-gray-900 dark:text-white">M: {student.motherName}</p>
              </div>
              <div>
                 <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">Date of Birth</p>
                 <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                    <span className="font-medium text-gray-900 dark:text-white">{student.dob}</span>
                 </div>
              </div>
              <div>
                 <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">Status</p>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                    {student.isActive ? 'Active Student' : 'Inactive'}
                 </span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Fee Status */}
         <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-fit transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-500" />
                Fee Status
            </h3>
            
            <div className="space-y-4">
               {student.previousDues.length > 0 && (
                 <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg space-y-2">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Arrears</span>
                    {student.previousDues.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                             <span className="text-gray-700 dark:text-gray-300">{d.year}</span>
                             <span className="font-bold text-red-700 dark:text-red-400">₹{d.amount}</span>
                        </div>
                    ))}
                 </div>
               )}

               <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Current Year Fee</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{student.currentYearFee.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Current Year Paid</span>
                  <span className="font-bold text-green-600 dark:text-green-400">- ₹{student.currentYearPaid.toLocaleString()}</span>
               </div>
               
               <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total Due</span>
                  <span className={`text-xl font-bold ${totalDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    ₹{totalDue.toLocaleString()}
                  </span>
               </div>
            </div>
         </div>

         {/* Payment History */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
               <History size={20} className="text-gray-400 dark:text-gray-500" />
               Payment History
            </h3>
            
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                   <thead className="bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-slate-700">
                      <tr>
                         <th className="py-3 px-4 font-medium">Receipt</th>
                         <th className="py-3 px-4 font-medium">Date</th>
                         <th className="py-3 px-4 font-medium">Mode</th>
                         <th className="py-3 px-4 font-medium">Recorded By</th>
                         <th className="py-3 px-4 font-medium text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {history.map(p => (
                         <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">{p.receiptNumber}</td>
                            <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{p.date}</td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs font-semibold">{p.method}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">{p.recordedBy.name}</td>
                            <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">₹{p.amount.toLocaleString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                   <History size={32} className="mb-2 opacity-50" />
                   <p>No payment records found.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default StudentProfile;
