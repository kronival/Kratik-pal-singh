
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUp, ArrowDown, CreditCard, User, TrendingUp, AlertCircle } from 'lucide-react';
import { sortClasses } from '../services/mockData';

const Dashboard = () => {
  const { students, payments, user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Dues');

  // --- Calculations ---
  const totalOutstanding = useMemo(() => {
    return students.reduce((sum, s) => {
      if (!s.isActive) return sum;
      const prev = s.previousDues.reduce((p, c) => p + Number(c.amount), 0);
      const currentDue = s.currentYearFee - s.currentYearPaid;
      return sum + prev + currentDue;
    }, 0);
  }, [students]);

  const collectedToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return payments
      .filter(p => p.date === today)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const defaulters = useMemo(() => {
    return students
      .filter(s => s.isActive)
      .map(s => {
        const currentDue = s.currentYearFee - s.currentYearPaid;
        const prevDue = s.previousDues.reduce((a, b) => a + Number(b.amount), 0);
        const totalDue = currentDue + prevDue;
        
        let statusLabel = 'Current';
        if (prevDue > 0) {
          statusLabel = 'Overdue';
        } else if (totalDue > 0) {
            statusLabel = 'Due';
        } else {
            statusLabel = 'Paid';
        }

        return { ...s, totalDue, statusLabel };
      })
      .filter(s => s.totalDue > 0)
      .sort((a, b) => b.totalDue - a.totalDue);
  }, [students]);

  const filteredList = useMemo(() => {
    let list = defaulters;
    
    // Search Filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.admissionNumber.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q)
      );
    }

    // Chip Filter
    if (activeFilter === 'Overdue') {
      list = list.filter(s => s.previousDues.reduce((sum, d) => sum + d.amount, 0) > 0);
    } else if (activeFilter.startsWith('Class')) {
      const cls = activeFilter.replace('Class ', '');
      list = list.filter(s => s.className === cls);
    }

    return list;
  }, [defaulters, search, activeFilter]);

  // Dynamic filters based on available classes (Sorted)
  const availableClasses = useMemo(() => {
      const classes = Array.from(new Set(students.map(s => s.className)));
      return sortClasses(classes);
  }, [students]);

  const filterChips = ['All Dues', 'Overdue', ...availableClasses.map(c => `Class ${c}`)];

  return (
    <div className="flex flex-col gap-6 w-full bg-gray-50 min-h-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">St. Xavier's School</h2>
          <p className="text-sm text-gray-500">Fee Management Dashboard</p>
        </div>
        <div className="hidden md:flex items-center justify-center bg-blue-50 text-blue-600 font-bold rounded-full w-12 h-12 text-lg border border-blue-100">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
             <AlertCircle size={18} className="text-gray-400" />
             <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{totalOutstanding.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUp size={16} className="text-red-500" />
            <p className="text-red-500 text-sm font-medium">+2.5% from last month</p>
          </div>
        </div>

        <div className="flex flex-col p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
             <TrendingUp size={18} className="text-gray-400" />
             <p className="text-sm font-medium text-gray-500">Collection Today</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{collectedToday.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowDown size={16} className="text-green-500" />
            <p className="text-green-500 text-sm font-medium">Steady flow today</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition duration-150 ease-in-out"
                placeholder="Search student by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterChips.map(chip => {
            const isActive = activeFilter === chip;
            return (
              <button 
                key={chip}
                onClick={() => setActiveFilter(chip)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Header */}
      <h3 className="text-lg font-bold text-gray-800 px-1">
        Students with Dues <span className="text-gray-400 font-normal text-sm ml-2">({filteredList.length})</span>
      </h3>

      {/* Students List */}
      <div className="grid gap-4">
        {filteredList.map(student => (
            <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <User size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-900 text-lg">{student.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold text-gray-600">Class {student.className}</span>
                          <span>•</span>
                          <span>{student.admissionNumber}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            student.statusLabel === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {student.statusLabel}
                        </span>
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-6 pl-16 sm:pl-0">
                  <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Total Due</p>
                      <p className="text-xl font-bold text-gray-900">₹{student.totalDue.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/payments', { state: { studentId: student.id, className: student.className } })}
                    className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm active:scale-95"
                    title="Pay Fees"
                  >
                      <CreditCard size={20} />
                  </button>
              </div>
            </div>
        ))}
        {filteredList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
