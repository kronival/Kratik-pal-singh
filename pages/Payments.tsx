
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Student, PaymentAllocation, Payment, PendingDue } from '../types';
import { 
  Search, Check, Printer, User, Calendar, 
  CreditCard, Banknote, Wallet, History, 
  AlertCircle, ArrowRight, X, ChevronRight, Percent, Calculator
} from 'lucide-react';
import { sortClasses } from '../services/mockData';
import { useLocation } from 'react-router-dom';

const Payments = () => {
  const { students, fees, payments, recordPayment, user } = useApp();
  const location = useLocation();
  
  // Step 1: Selection
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  // Step 2: Entry
  const [amount, setAmount] = useState<string>('');
  const [discount, setDiscount] = useState<string>(''); // Admin only
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CHEQUE' | 'CARD'>('CASH');
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [manualAllocation, setManualAllocation] = useState(false);
  const [note, setNote] = useState('');

  // Step 3: Result
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  // Handle incoming navigation state (redirect from Dashboard/Profile)
  useEffect(() => {
    if (location.state && location.state.studentId) {
        if (location.state.className) {
            setSelectedClass(location.state.className);
        }
        setSelectedStudentId(location.state.studentId);
    }
  }, [location.state]);

  // Derived Data
  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId), 
  [students, selectedStudentId]);

  const studentHistory = useMemo(() => 
    selectedStudentId ? payments.filter(p => p.studentId === selectedStudentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [],
  [payments, selectedStudentId]);

  const availableClasses = useMemo(() => 
    sortClasses(fees.map(f => f.className)), 
  [fees]);

  // Helper to sort dues by year (e.g. "2023-24" before "2024-25")
  const sortDuesByYear = (dues: PendingDue[]) => {
      return [...dues].sort((a, b) => a.year.localeCompare(b.year));
  };

  // Initial allocation logic when amount OR discount changes
  useEffect(() => {
    if (!selectedStudent || manualAllocation) return;
    
    const paidAmount = parseFloat(amount) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const totalAvailable = paidAmount + discountAmount;

    if (totalAvailable <= 0) {
      setAllocations([]);
      return;
    }

    let remaining = totalAvailable;
    const newAllocations: PaymentAllocation[] = [];

    // 1. Pay previous dues first (Sorted Oldest First)
    const sortedPrevDues = sortDuesByYear(selectedStudent.previousDues);
    
    sortedPrevDues.forEach(due => {
      if (remaining > 0 && Number(due.amount) > 0) {
        const paying = Math.min(remaining, Number(due.amount));
        newAllocations.push({ year: due.year, amount: paying });
        remaining -= paying;
      }
    });

    // 2. Pay current year
    const currentDue = selectedStudent.currentYearFee - selectedStudent.currentYearPaid;
    if (remaining > 0 && currentDue > 0) {
       const paying = Math.min(remaining, currentDue);
       newAllocations.push({ year: '2025-26', amount: paying });
       remaining -= paying;
    }

    setAllocations(newAllocations);
  }, [amount, discount, selectedStudent, manualAllocation]);

  const handleRecordPayment = () => {
    if (!selectedStudent || !user || Number(amount) < 0) return;
    // Note: Amount can be 0 if full discount is applied
    if (Number(amount) === 0 && Number(discount) <= 0) return;

    // Validate total allocation matches total power (amount + discount)
    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const totalPaymentPower = Number(amount) + (Number(discount) || 0);

    if (Math.abs(totalAllocated - totalPaymentPower) > 1) {
      alert("Allocated amount must match the total payment + discount.");
      return;
    }

    const paymentData = {
      studentId: selectedStudent.id,
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      discount: Number(discount) || 0,
      method: paymentMethod,
      allocations,
      recordedBy: { id: user.id, name: user.name }
    };

    recordPayment(paymentData);

    // Simulate getting the record back (in real app, backend returns it)
    const mockPaymentRecord: Payment = {
        ...paymentData,
        id: 'temp-' + Date.now(),
        receiptNumber: `REC-${1000 + payments.length + 1}`
    };
    
    setLastPayment(mockPaymentRecord);
  };

  const resetForm = () => {
    setAmount('');
    setDiscount('');
    setAllocations([]);
    setLastPayment(null);
    setNote('');
  };

  const clearSelection = () => {
      setSelectedStudentId('');
      resetForm();
  };

  const getBalance = (student: Student) => {
      const prev = student.previousDues.reduce((s, d) => s + Number(d.amount), 0);
      const curr = student.currentYearFee - student.currentYearPaid;
      return prev + curr;
  }

  // -- UI Helpers --
  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
  const totalAvailable = (Number(amount) || 0) + (Number(discount) || 0);
  const allocationDiff = totalAvailable - totalAllocated;
  const isAllocationValid = Math.abs(allocationDiff) < 1;

  // -- Subcomponents --

  const ReceiptView = () => {
    if (!selectedStudent || !lastPayment) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 bg-green-600 text-white text-center relative no-print">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
              <Check size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold">Payment Successful</h3>
            <p className="text-green-100 text-sm">Receipt #{lastPayment.receiptNumber}</p>
            <button onClick={resetForm} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <X size={24} />
            </button>
          </div>

          {/* Printable Area */}
          <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-800 dark:text-white" id="receipt-content">
            <div className="text-center border-b border-dashed border-gray-200 dark:border-slate-600 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ajanta Public School</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Official Fee Receipt</p>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Date</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lastPayment.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Student</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Class / Adm No</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedStudent.className} / {selectedStudent.admissionNumber}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Payment Mode</span>
                    <span className="font-medium text-gray-900 dark:text-white">{lastPayment.method}</span>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border border-gray-100 dark:border-slate-600 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-300 text-sm">Amount Paid</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{lastPayment.amount}</span>
                </div>
                {lastPayment.discount && lastPayment.discount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-600 dark:text-green-400">
                        <span className="text-sm">Discount Applied</span>
                        <span className="font-bold">-₹{lastPayment.discount}</span>
                    </div>
                )}
                <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-slate-600">
                    {lastPayment.allocations.map((alloc, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500 dark:text-gray-300">
                            <span>{alloc.year === '2025-26' ? 'Tuition Fees (Current)' : `Arrears (${alloc.year})`}</span>
                            <span>Cleared: ₹{alloc.amount}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">Collected by {lastPayment.recordedBy.name}</p>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex gap-3 no-print">
            <button 
                onClick={() => window.print()} 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Printer size={18} /> Print
            </button>
            <button 
                onClick={resetForm} 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Next <span className="hidden sm:inline">Payment</span> <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {lastPayment && <ReceiptView />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Fee Collection</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Search for a student to record a new payment</p>
        </div>
        
        {/* Quick Class Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm w-full md:w-auto transition-colors">
             <select 
               className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-200 py-2 pl-3 pr-8 outline-none border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-slate-700 w-full sm:w-auto"
               value={selectedClass}
               onChange={e => { setSelectedClass(e.target.value); setSelectedStudentId(''); }}
             >
               <option value="">Class...</option>
               {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                <select 
                    className="w-full appearance-none bg-transparent text-sm py-2 pl-8 pr-4 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 cursor-pointer"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                >
                    <option value="">Select Student...</option>
                    {students
                        .filter(s => (!selectedClass || s.className === selectedClass) && s.isActive)
                        .map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.admissionNumber})</option>
                        ))}
                </select>
             </div>
        </div>
      </div>

      {!selectedStudent ? (
         <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 text-center p-4 transition-colors">
            <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 text-blue-500 dark:text-blue-400">
                <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Student Selected</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">Please select a class and student from the top bar to view their fee details and record payments.</p>
         </div>
      ) : (
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Student Profile & History */}
            <div className="lg:col-span-4 space-y-6">
                {/* Profile Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-800 dark:to-blue-600"></div>
                    <div className="px-6 pb-6 relative">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full border-4 border-white dark:border-slate-800 absolute -top-10 flex items-center justify-center shadow-md text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {selectedStudent.name.charAt(0)}
                        </div>
                        <div className="pt-12 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedStudent.admissionNumber}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                Class {selectedStudent.className}
                            </span>
                        </div>
                        
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Father's Name</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.fatherName}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                                <span className={`text-sm font-bold ${selectedStudent.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {selectedStudent.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outstanding Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <AlertCircle size={18} className="text-orange-500" />
                        Fee Dues
                    </h4>
                    
                    <div className="space-y-0">
                        {/* Previous Dues */}
                        {sortDuesByYear(selectedStudent.previousDues).map((due, idx) => (
                             <div key={`prev-${idx}`} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Arrears ({due.year})</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">Previous Session</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">₹{due.amount}</span>
                             </div>
                        ))}

                        {/* Current Year */}
                        <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-slate-700">
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tuition Fee (2025-26)</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">Total: ₹{selectedStudent.currentYearFee}</span>
                             </div>
                             <div className="text-right">
                                 <span className="block font-bold text-gray-900 dark:text-white">₹{selectedStudent.currentYearFee - selectedStudent.currentYearPaid}</span>
                                 {selectedStudent.currentYearPaid > 0 && (
                                     <span className="text-xs text-green-600 dark:text-green-400">Paid: ₹{selectedStudent.currentYearPaid}</span>
                                 )}
                             </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">Total Payable</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{getBalance(selectedStudent)}</span>
                    </div>
                </div>

                {/* Recent History */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors">
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                        <History size={18} className="text-gray-400 dark:text-gray-500" />
                        Recent Payments
                    </h4>
                    {studentHistory.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No payment history found.</p>
                    ) : (
                        <div className="space-y-4">
                            {studentHistory.slice(0, 3).map(p => (
                                <div key={p.id} className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">₹{p.amount}</p>
                                        {p.discount && p.discount > 0 && (
                                            <span className="text-xs text-green-600 dark:text-green-400 block">(-₹{p.discount} off)</span>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{p.date} • {p.method}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">{p.receiptNumber}</span>
                                </div>
                            ))}
                             {studentHistory.length > 3 && (
                                <button className="w-full text-center text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline pt-2">View All History</button>
                             )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="lg:col-span-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 lg:p-8 h-full transition-colors">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Transaction</h3>
                        <button onClick={clearSelection} className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">Clear Form</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Transaction Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                                <input 
                                    type="date" 
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-white" 
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Payment Mode</label>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                 {[
                                     { id: 'CASH', icon: Banknote, label: 'Cash' },
                                     { id: 'UPI', icon: Wallet, label: 'UPI' },
                                     { id: 'CARD', icon: CreditCard, label: 'Card' },
                                     { id: 'CHEQUE', icon: ArrowRight, label: 'Chq' },
                                 ].map((m) => (
                                     <button
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id as any)}
                                        className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 ${
                                            paymentMethod === m.id 
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm scale-[1.02]' 
                                            : 'bg-white dark:bg-slate-700 border-gray-100 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-gray-200 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-600'
                                        }`}
                                     >
                                         <m.icon size={20} className="mb-1" />
                                         <span className="text-xs font-bold">{m.label}</span>
                                     </button>
                                 ))}
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Amount Received</label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-4xl font-bold pointer-events-none">₹</span>
                                <input 
                                    type="number" 
                                    placeholder="0"
                                    className="w-full pl-16 pr-6 py-6 text-4xl font-bold text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-600 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-slate-700 shadow-sm"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        {/* Admin Only Discount Field */}
                        {user?.role === 'ADMIN' && (
                            <div>
                                <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                                    <Percent size={14} /> Discount / Waiver
                                </label>
                                <div className="relative shadow-sm rounded-xl">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 dark:text-green-400 text-xl font-bold">-₹</span>
                                    <input 
                                        type="number" 
                                        placeholder="0"
                                        className="w-full pl-12 pr-4 py-4 text-xl font-bold text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                        value={discount}
                                        onChange={e => setDiscount(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Allocation Section */}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700 mb-8 transition-colors">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-slate-600">
                            <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase flex items-center gap-2">
                                <Calculator size={16} /> Allocation Breakdown
                            </h4>
                            <label className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={manualAllocation}
                                    onChange={e => setManualAllocation(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:border-slate-500"
                                />
                                <span className="font-medium">Manual Allocation</span>
                            </label>
                        </div>

                        {/* Balance Check Indicator */}
                        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs sm:text-sm">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-600">
                                <p className="text-gray-500 dark:text-gray-400">Total Available</p>
                                <p className="font-bold text-gray-900 dark:text-white">₹{totalAvailable}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-2 rounded border border-gray-100 dark:border-slate-600">
                                <p className="text-gray-500 dark:text-gray-400">Allocated</p>
                                <p className="font-bold text-blue-600 dark:text-blue-400">₹{totalAllocated}</p>
                            </div>
                            <div className={`p-2 rounded border ${isAllocationValid ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400'}`}>
                                <p className="opacity-70">Remaining</p>
                                <p className="font-bold">₹{allocationDiff}</p>
                            </div>
                        </div>

                        {allocations.length > 0 ? (
                            <div className="space-y-3">
                                {allocations.map((alloc, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-600 shadow-sm">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                                            {alloc.year.slice(0,4)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {alloc.year === '2025-26' ? 'Current Session' : `Arrears ${alloc.year}`}
                                            </p>
                                            <div className="w-full bg-gray-100 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                        {manualAllocation ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">₹</span>
                                                <input 
                                                    type="number" 
                                                    className="w-24 border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-right font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={alloc.amount}
                                                    onChange={e => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const newAlloc = [...allocations];
                                                        newAlloc[i].amount = val;
                                                        setAllocations(newAlloc);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <span className="font-bold text-lg text-gray-900 dark:text-white whitespace-nowrap">₹{alloc.amount}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm bg-white/50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-600">
                                <p>Enter an amount to view allocation breakdown.</p>
                            </div>
                        )}
                        
                        {/* Unallocated Warning */}
                        {!isAllocationValid && (Number(amount) > 0 || Number(discount) > 0) && (
                             <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                                 <AlertCircle size={16} />
                                 {allocationDiff > 0 
                                    ? `You have ₹${allocationDiff} remaining to allocate.` 
                                    : `You have allocated ₹${Math.abs(allocationDiff)} more than available.`}
                             </div>
                        )}
                    </div>

                    <button 
                        onClick={handleRecordPayment}
                        disabled={!isAllocationValid || (Number(amount) <= 0 && Number(discount) <= 0) || !selectedStudent}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Check size={24} />
                        Confirm Payment
                    </button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Payments;
