import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Payment, Student } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type ReportType = 'outstanding' | 'collection' | 'ledger' | 'daily';

const Reports: React.FC = () => {
  // Data State from Context
  const { payments, students, fees } = useApp();

  // Derived Constants
  const CLASSES = useMemo(() => fees.map(f => f.className).sort(), [fees]);

  // UI State
  const [activeReport, setActiveReport] = useState<ReportType>('collection');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0].slice(0, 7) + '-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedStaff, setSelectedStaff] = useState('All Staff');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Report Result State
  const [generated, setGenerated] = useState(false);
  const [displayData, setDisplayData] = useState<{
    summary: { label: string; value: string; icon: string };
    subtitle: string;
    headers: string[];
    rows: any[][];
  } | null>(null);

  // Extract unique staff names from payments
  const staffList = useMemo(() => {
    const staff = new Set(payments.map(p => p.recordedBy.name));
    return Array.from(staff).sort();
  }, [payments]);

  // Handler for Report Type Selection
  const handleReportTypeChange = (type: ReportType) => {
    setActiveReport(type);
    setGenerated(false);
    setDisplayData(null);
    
    // Reset/Preset filters based on type
    const today = new Date().toISOString().split('T')[0];
    if (type === 'daily') {
      setStartDate(today);
      setEndDate(today);
    } else if (type === 'collection') {
      setStartDate(today.slice(0, 7) + '-01');
      setEndDate(today);
    }
  };

  const generateReport = () => {
    let summary = { label: '', value: '', icon: '' };
    let subtitle = '';
    let headers: string[] = [];
    let rows: any[][] = [];

    if (activeReport === 'outstanding') {
      // OUTSTANDING FEES REPORT
      let filteredStudents = students;
      if (selectedClass !== 'All Classes') {
        filteredStudents = filteredStudents.filter(s => s.className === selectedClass);
      }

      const reportItems = filteredStudents
        .map(s => {
          const prevDue = s.previousDues.reduce((a, b) => a + Number(b.amount), 0);
          const currentOutstanding = s.currentYearFee - s.currentYearPaid;
          const due = currentOutstanding + prevDue;
          return { ...s, due };
        })
        .filter(s => s.due > 0)
        .sort((a, b) => b.due - a.due);

      const totalDue = reportItems.reduce((sum, s) => sum + s.due, 0);

      summary = { 
        label: 'Total Outstanding', 
        value: `₹${totalDue.toLocaleString()}`, 
        icon: 'report' 
      };
      subtitle = `As of ${new Date().toLocaleDateString()} • ${selectedClass}`;
      headers = ['Adm No', 'Name', 'Class', 'Father Name', 'Amount Due'];
      rows = reportItems.map(s => [s.admissionNumber, s.name, s.className, s.fatherName, `₹${s.due}`]);

    } else if (activeReport === 'collection' || activeReport === 'daily') {
      // COLLECTION & DAILY REPORT
      let filteredPayments = payments.filter(p => {
        const pDate = p.date; // YYYY-MM-DD
        return pDate >= startDate && pDate <= endDate;
      });

      // Map payments with student details for filtering
      const enrichedPayments = filteredPayments.map(p => {
         const s = students.find(st => st.id === p.studentId);
         return {
             ...p,
             studentName: s?.name || 'Unknown',
             studentClass: s?.className || 'Unknown'
         };
      });

      if (selectedClass !== 'All Classes') {
        // Filter based on the *current* class of the student, or historical if we tracked it. 
        // For simplicity, we filter by current student class.
        // Note: If strict historical reporting is needed, payment record should store studentClass at time of payment.
        // Assuming enrichedPayments handles this via lookup.
      }
      
      // Actually apply class filter on enriched data
      let finalPayments = enrichedPayments;
      if (selectedClass !== 'All Classes') {
         finalPayments = finalPayments.filter(p => p.studentClass === selectedClass);
      }

      if (selectedStaff !== 'All Staff') {
        finalPayments = finalPayments.filter(p => p.recordedBy.name === selectedStaff);
      }

      const totalCollection = finalPayments.reduce((sum, p) => sum + p.amount, 0);

      summary = { 
        label: 'Total Collection', 
        value: `₹${totalCollection.toLocaleString()}`, 
        icon: 'payments' 
      };
      subtitle = `Period: ${startDate} to ${endDate}${selectedStaff !== 'All Staff' ? ` • Staff: ${selectedStaff}` : ''}`;
      headers = ['Date', 'Receipt', 'Student', 'Class', 'Mode', 'Recorded By', 'Amount'];
      rows = finalPayments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(p => [p.date, p.receiptNumber, p.studentName, p.studentClass, p.method, p.recordedBy.name, `₹${p.amount}`]);
    
    } else if (activeReport === 'ledger') {
      // STUDENT LEDGER
      let filteredPayments = payments;
      
      // If student is selected, show specific history
      if (selectedStudentId) {
        filteredPayments = filteredPayments.filter(p => p.studentId === selectedStudentId);
        const student = students.find(s => s.id === selectedStudentId);
        
        if (selectedStaff !== 'All Staff') {
            filteredPayments = filteredPayments.filter(p => p.recordedBy.name === selectedStaff);
        }

        const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        
        summary = {
          label: 'Total Paid by Student',
          value: `₹${totalPaid.toLocaleString()}`,
          icon: 'person_search'
        };
        subtitle = student ? `${student.name} (Class ${student.className})` : 'Selected Student';
        
        headers = ['Date', 'Receipt', 'Type', 'Allocations', 'Recorded By', 'Amount'];
        rows = filteredPayments
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(p => [
              p.date, 
              p.receiptNumber, 
              p.method, 
              p.allocations.map(a => `${a.year}: ₹${a.amount}`).join(', '),
              p.recordedBy.name, 
              `₹${p.amount}`
          ]);

      } else {
        // General transaction ledger if no specific student
         let enriched = filteredPayments.map(p => {
             const s = students.find(st => st.id === p.studentId);
             return { ...p, studentName: s?.name || 'Unknown', studentClass: s?.className || '-' };
         });

         if (selectedClass !== 'All Classes') {
            enriched = enriched.filter(p => p.studentClass === selectedClass);
         }
         enriched = enriched.filter(p => p.date >= startDate && p.date <= endDate);
         
         if (selectedStaff !== 'All Staff') {
            enriched = enriched.filter(p => p.recordedBy.name === selectedStaff);
         }
         
         const total = enriched.reduce((sum, p) => sum + p.amount, 0);
         summary = { label: 'Ledger Total', value: `₹${total.toLocaleString()}`, icon: 'list_alt' };
         subtitle = `Transactions from ${startDate} to ${endDate}`;
         
         headers = ['Date', 'Receipt', 'Student', 'Class', 'Mode', 'Amount'];
         rows = enriched
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(p => [p.date, p.receiptNumber, p.studentName, p.studentClass, p.method, `₹${p.amount}`]);
      }
    }

    setDisplayData({ summary, subtitle, headers, rows });
    setGenerated(true);
  };

  const exportPDF = () => {
    if (!displayData) return;
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(activeReport.toUpperCase().replace('_', ' ') + " REPORT", 14, 20);
    
    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(displayData.subtitle, 14, 30);
    
    // Summary
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`${displayData.summary.label}: ${displayData.summary.value}`, 14, 40);

    // Table
    autoTable(doc, {
        head: [displayData.headers],
        body: displayData.rows,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] } // Blue-600
    });
    
    doc.save(`${activeReport}_report.pdf`);
  };

  return (
    <div className="flex flex-col flex-1 max-w-6xl mx-auto w-full pb-12">
      {/* Main Content */}
      <main className="flex-1">
        {/* Headline Text */}
        <h2 className="text-gray-900 tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
          Select a Report
        </h2>

        {/* Report Type Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4 p-4">
          {/* Outstanding Fees */}
          <div 
            onClick={() => handleReportTypeChange('outstanding')}
            className={`flex flex-1 gap-3 rounded-xl border p-4 flex-col cursor-pointer transition-all duration-200 ${
              activeReport === 'outstanding' 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-gray-200 bg-white hover:border-blue-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="text-blue-600 text-3xl">
              <span className="material-symbols-outlined">report</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-gray-900 text-base font-bold leading-tight">Outstanding Fees</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">View pending fees by class</p>
            </div>
          </div>

          {/* Collection Summary */}
          <div 
            onClick={() => handleReportTypeChange('collection')}
            className={`flex flex-1 gap-3 rounded-xl border p-4 flex-col cursor-pointer transition-all duration-200 ${
              activeReport === 'collection' 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-gray-200 bg-white hover:border-blue-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="text-blue-600 text-3xl">
              <span className="material-symbols-outlined">request_quote</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-gray-900 text-base font-bold leading-tight">Collection Summary</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">Total fees collected in a date range</p>
            </div>
          </div>

          {/* Student Ledger */}
          <div 
            onClick={() => handleReportTypeChange('ledger')}
            className={`flex flex-1 gap-3 rounded-xl border p-4 flex-col cursor-pointer transition-all duration-200 ${
              activeReport === 'ledger' 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-gray-200 bg-white hover:border-blue-200 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="text-blue-600 text-3xl">
              <span className="material-symbols-outlined">person_search</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-gray-900 text-base font-bold leading-tight">Student Ledger</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">Transaction history for a student</p>
            </div>
          </div>

          {/* Daily Payments */}
          <div 
             onClick={() => handleReportTypeChange('daily')}
             className={`flex flex-1 gap-3 rounded-xl border p-4 flex-col cursor-pointer transition-all duration-200 ${
               activeReport === 'daily' 
                 ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                 : 'border-gray-200 bg-white hover:border-blue-200 shadow-sm hover:shadow-md'
             }`}
          >
            <div className="text-blue-600 text-3xl">
              <span className="material-symbols-outlined">today</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-gray-900 text-base font-bold leading-tight">Daily Payments</h3>
              <p className="text-gray-500 text-sm font-normal leading-normal">All payments on a specific date</p>
            </div>
          </div>
        </div>

        {/* Filter and Generate Report Section */}
        <div className="px-4 py-4 mt-4 border-t border-gray-200">
          <h3 className="text-gray-900 text-xl font-bold leading-tight pb-4">Generate Report</h3>
          <div className="space-y-4 max-w-3xl">
            
            {/* Date Filters - Hidden for Outstanding Fees */}
            {activeReport !== 'outstanding' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 pb-1.5">
                   {activeReport === 'daily' ? 'Select Date' : 'Select Date Range'}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        if (activeReport === 'daily') setEndDate(e.target.value);
                    }}
                    className="block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 p-2.5 border"
                  />
                  {activeReport !== 'daily' && (
                    <>
                        <span className="text-gray-500 hidden sm:inline">-</span>
                        <span className="text-gray-500 sm:hidden text-xs text-center w-full">to</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 p-2.5 border"
                        />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Class Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-600 pb-1.5" htmlFor="class-filter">Filter by Class</label>
              <select 
                id="class-filter"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 p-2.5 border"
              >
                <option>All Classes</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            {/* Staff/Recorder Filter - Only relevant for payment-based reports */}
            {activeReport !== 'outstanding' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 pb-1.5">Filter by Staff</label>
                <select 
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 p-2.5 border"
                >
                    <option>All Staff</option>
                    {staffList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* Student Filter (Only for Ledger) */}
            {activeReport === 'ledger' && (
              <div>
                  <label className="block text-sm font-medium text-gray-600 pb-1.5">Select Student (Optional)</label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-white text-sm text-gray-900 focus:border-blue-600 focus:ring-blue-600 p-2.5 border"
                  >
                      <option value="">-- All Students --</option>
                      {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                      ))}
                  </select>
              </div>
            )}

            <button 
              onClick={generateReport}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 px-4 text-center font-bold text-white transition-colors hover:bg-blue-700 shadow-sm mt-2"
            >
              <span className="material-symbols-outlined">summarize</span>
              Generate Report
            </button>
          </div>
        </div>

        {/* Report View */}
        {generated && displayData && (
          <div className="px-4 py-4 mt-4 border-t border-gray-200 animate-in slide-in-from-bottom-2 fade-in duration-300">
            {/* Report Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-900 text-xl font-bold leading-tight capitalize">
                {activeReport.replace('_', ' ')} Report
              </h3>
              <div className="flex items-center gap-2">
                <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center size-9 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Print"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                </button>
                <button 
                    onClick={exportPDF}
                    className="flex items-center justify-center size-9 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                    title="Download PDF"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-emerald-700">{displayData.summary.label}</p>
                <p className="text-2xl font-bold text-emerald-600">{displayData.summary.value}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-emerald-600">
                {displayData.summary.icon}
              </span>
            </div>
            <p className="text-xs text-gray-500 -mt-4 mb-4">{displayData.subtitle}</p>

            {/* Table View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {displayData.headers.map((h, i) => (
                        <th key={i} className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        {row.map((cell: any, cIdx: number) => (
                          <td key={cIdx} className="px-6 py-3 text-gray-600 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {displayData.rows.length === 0 && (
                        <tr>
                            <td colSpan={displayData.headers.length} className="px-6 py-8 text-center text-gray-500">
                                No records found for the selected criteria.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Reports;