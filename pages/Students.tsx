
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Student, PendingDue } from '../types';
import { Search, Plus, Filter, Edit2, Trash2, X, Save, AlertTriangle, Users, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ACADEMIC_YEAR = '2025-26';

const Students = () => {
  const { students, fees, addStudent, updateStudent, deleteStudent, user } = useApp();
  const navigate = useNavigate();
  
  // State
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, studentId: string | null}>({
      isOpen: false,
      studentId: null
  });

  // Form State
  const initialForm: Partial<Student> = {
    admissionNumber: '', name: '', fatherName: '', motherName: '', dob: '', className: 'LKG', 
    previousDues: [], currentYearFee: 0, currentYearPaid: 0, isActive: true, siblingIds: []
  };
  const [formData, setFormData] = useState<Partial<Student>>(initialForm);
  const [prevDueInput, setPrevDueInput] = useState<PendingDue>({ year: '', amount: 0, className: '' });
  
  // Sibling Search
  const [siblingQuery, setSiblingQuery] = useState('');

  // Derived constants
  const CLASSES = fees.map(f => f.className).sort();

  // Filter Logic
  useEffect(() => {
    let res = students;
    if (classFilter) res = res.filter(s => s.className === classFilter);
    if (search) {
      const lower = search.toLowerCase();
      res = res.filter(s => 
        s.name.toLowerCase().includes(lower) || 
        s.admissionNumber.toLowerCase().includes(lower) ||
        s.fatherName.toLowerCase().includes(lower)
      );
    }
    setFilteredStudents(res);
  }, [search, classFilter, students]);

  // Handlers
  const handleClassChange = (cls: string) => {
    const fee = fees.find(f => f.className === cls);
    setFormData(prev => ({
      ...prev,
      className: cls,
      currentYearFee: fee ? fee.total : 0
    }));
  };

  const handleSave = () => {
    if (!formData.admissionNumber || !formData.name || !formData.className) {
        alert("Required fields missing (Admission No, Name, Class)");
        return;
    }

    const studentPayload: any = {
        ...formData,
        previousDues: formData.previousDues || [],
        siblingIds: formData.siblingIds || []
    };

    if (editingId) {
        updateStudent(editingId, studentPayload);
    } else {
        addStudent(studentPayload);
    }
    setIsModalOpen(false);
  };

  const promptDelete = (id: string) => {
      setDeleteConfirm({ isOpen: true, studentId: id });
  };

  const confirmDelete = () => {
      if (deleteConfirm.studentId) {
          deleteStudent(deleteConfirm.studentId);
          setDeleteConfirm({ isOpen: false, studentId: null });
      }
  };

  const openEdit = (e: React.MouseEvent, s: Student) => {
    e.stopPropagation();
    setEditingId(s.id);
    setFormData(JSON.parse(JSON.stringify(s)));
    setSiblingQuery('');
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    const defaultClass = CLASSES[0] || 'LKG';
    const defaultFee = fees.find(f => f.className === defaultClass)?.total || 0;
    setFormData({ ...initialForm, className: defaultClass, currentYearFee: defaultFee });
    setSiblingQuery('');
    setIsModalOpen(true);
  };

  const addPendingRow = () => {
    if (!prevDueInput.year || prevDueInput.amount <= 0) return;
    setFormData(prev => ({
      ...prev,
      previousDues: [...(prev.previousDues || []), { ...prevDueInput }]
    }));
    setPrevDueInput({ year: '', amount: 0, className: '' });
  };

  const removePendingRow = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      previousDues: prev.previousDues?.filter((_, i) => i !== idx)
    }));
  };

  // Sibling Logic
  const addSibling = (id: string) => {
    if (formData.siblingIds?.includes(id)) return;
    setFormData(prev => ({
        ...prev,
        siblingIds: [...(prev.siblingIds || []), id]
    }));
    setSiblingQuery('');
  };

  const removeSibling = (id: string) => {
    setFormData(prev => ({
        ...prev,
        siblingIds: prev.siblingIds?.filter(sid => sid !== id)
    }));
  };

  const potentialSiblings = students.filter(s => 
    s.id !== editingId && // Not self
    !formData.siblingIds?.includes(s.id) && // Not already added
    (s.name.toLowerCase().includes(siblingQuery.toLowerCase()) || 
     s.admissionNumber.toLowerCase().includes(siblingQuery.toLowerCase()))
  ).slice(0, 5); // Limit results

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Students</h2>
        {(isAdmin || user?.role === 'ACCOUNTANT') && (
          <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm dark:bg-blue-500 dark:hover:bg-blue-600 w-full md:w-auto justify-center">
            <Plus size={18} /> Add Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, Admission No, or father's name..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400 dark:text-gray-500 shrink-0" size={18} />
          <select 
            className="w-full md:w-auto border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
          >
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-gray-300">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600 font-semibold text-slate-900 dark:text-white">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Adm No</th>
                <th className="px-6 py-4 whitespace-nowrap">Name</th>
                <th className="px-6 py-4 whitespace-nowrap">Class</th>
                <th className="px-6 py-4 whitespace-nowrap">Outstanding</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredStudents.map(s => {
                const prevTotal = s.previousDues.reduce((a, b) => a + Number(b.amount), 0);
                const currentOutstanding = s.currentYearFee - s.currentYearPaid;
                const totalDue = currentOutstanding + prevTotal;

                return (
                  <tr 
                    key={s.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/students/${s.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{s.admissionNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</div>
                      <div className="text-xs text-slate-400 dark:text-gray-500">F: {s.fatherName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">{s.className}</span>
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                        {totalDue > 0 ? (
                            <span className="text-red-600 dark:text-red-400">₹{totalDue.toLocaleString()}</span>
                        ) : (
                            <span className="text-green-600 dark:text-green-400">Paid</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {totalDue === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Cleared
                        </span>
                      ) : prevTotal > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                          Due
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 flex justify-end whitespace-nowrap">
                      {(isAdmin || user?.role === 'ACCOUNTANT') && (
                        <button 
                            onClick={(e) => openEdit(e, s)} 
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                            title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                       {isAdmin && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); promptDelete(s.id); }} 
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <Search size={24} className="text-slate-300 dark:text-gray-600" />
                        <p>No students found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto mb-4">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Student Record?</h3>
                  <p className="text-center text-slate-500 dark:text-gray-400 text-sm mb-6">
                      Are you sure you want to delete this student? This action cannot be undone and all fee history will be lost.
                  </p>
                  <div className="flex gap-3">
                      <button 
                        onClick={() => setDeleteConfirm({isOpen: false, studentId: null})}
                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-gray-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200 border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingId ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
                <X />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Admission No *</label>
                  <input 
                    disabled={!!editingId}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-gray-400"
                    value={formData.admissionNumber}
                    onChange={e => setFormData({...formData, admissionNumber: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Date of Birth</label>
                   <input type="date" className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                   />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Student Name *</label>
                  <input className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Class (Current)</label>
                   <select className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.className}
                    onChange={e => handleClassChange(e.target.value)}
                   >
                     {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Father's Name</label>
                  <input className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.fatherName}
                    onChange={e => setFormData({...formData, fatherName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Mother's Name</label>
                  <input className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.motherName}
                    onChange={e => setFormData({...formData, motherName: e.target.value})}
                  />
                </div>
              </div>

              {/* Sibling Selection Section */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <Users size={16} /> Link Siblings
                </label>
                
                {/* Search Box */}
                <div className="relative mb-3">
                    <input 
                        placeholder="Search student to add as sibling..."
                        className="w-full p-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={siblingQuery}
                        onChange={e => setSiblingQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500" size={16} />
                    
                    {/* Search Results Dropdown */}
                    {siblingQuery && potentialSiblings.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                            {potentialSiblings.map(s => (
                                <button 
                                    key={s.id}
                                    type="button"
                                    onClick={() => addSibling(s.id)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm flex justify-between items-center group"
                                >
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{s.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-400">Class {s.className} • Adm: {s.admissionNumber}</p>
                                    </div>
                                    <Plus size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Siblings List */}
                <div className="space-y-2">
                    {formData.siblingIds && formData.siblingIds.length > 0 ? (
                        formData.siblingIds.map(sibId => {
                            const sib = students.find(s => s.id === sibId);
                            if (!sib) return null;
                            return (
                                <div key={sib.id} className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-2 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={14} className="text-blue-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-gray-200">{sib.name}</span>
                                        <span className="text-xs text-slate-500 dark:text-gray-400">(Class {sib.className})</span>
                                    </div>
                                    <button 
                                        onClick={() => removeSibling(sib.id)}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-xs text-slate-400 italic">No siblings added yet.</p>
                    )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                 <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2">
                    Current Year Fee ({ACADEMIC_YEAR})
                 </label>
                 <input 
                   type="number"
                   className="w-full md:w-1/2 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                   value={formData.currentYearFee}
                   onChange={e => setFormData({...formData, currentYearFee: Number(e.target.value)})}
                 />
                 <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Automatically fetched from fee config. Can be overridden for scholarships.
                 </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                 <label className="block text-sm font-bold text-slate-800 dark:text-white mb-2">Previous Year Dues</label>
                 <div className="space-y-2 mb-3">
                   {formData.previousDues?.map((p, idx) => (
                     <div key={idx} className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-2 rounded-lg">
                       <span className="flex-1 text-sm font-medium text-slate-700 dark:text-gray-300">{p.year} ({p.className || '-'})</span>
                       <span className="font-bold text-red-700 dark:text-red-400">₹{p.amount}</span>
                       <button onClick={() => removePendingRow(idx)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded">
                         <X size={16} />
                       </button>
                     </div>
                   ))}
                 </div>
                 <div className="flex gap-2">
                    <input 
                      placeholder="Year (2023-24)"
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[100px]"
                      value={prevDueInput.year}
                      onChange={e => setPrevDueInput({...prevDueInput, year: e.target.value})}
                    />
                    <input 
                      placeholder="Class (UKG)"
                      className="w-24 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={prevDueInput.className || ''}
                      onChange={e => setPrevDueInput({...prevDueInput, className: e.target.value})}
                    />
                    <input 
                      type="number"
                      placeholder="Amount"
                      className="w-28 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={prevDueInput.amount || ''}
                      onChange={e => setPrevDueInput({...prevDueInput, amount: Number(e.target.value)})}
                    />
                    <button 
                        type="button"
                        onClick={addPendingRow}
                        className="bg-slate-800 dark:bg-slate-600 text-white hover:bg-slate-900 dark:hover:bg-slate-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Add
                    </button>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-gray-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-colors shadow-sm">
                <Save size={18} /> Save Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
