import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FeeStructure } from '../types';

const Fees = () => {
  const { fees, updateFeeStructure } = useApp();
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FeeStructure>>({});

  const handleEdit = (fee: FeeStructure) => {
    setEditingClass(fee.className);
    setEditForm(fee);
  };

  const handleSave = () => {
    if (editForm.className && editForm.tuitionFee !== undefined && editForm.annualFee !== undefined) {
        updateFeeStructure({
            className: editForm.className,
            tuitionFee: Number(editForm.tuitionFee),
            annualFee: Number(editForm.annualFee),
            total: Number(editForm.tuitionFee) + Number(editForm.annualFee)
        });
        setEditingClass(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Fee Configuration (2025-26)</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
             <tr>
               <th className="p-4 font-semibold text-gray-600">Class</th>
               <th className="p-4 font-semibold text-gray-600 text-right">Annual Fee</th>
               <th className="p-4 font-semibold text-gray-600 text-right">Tuition Fee</th>
               <th className="p-4 font-semibold text-gray-600 text-right">Total</th>
               <th className="p-4 font-semibold text-gray-600 text-center">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {fees.map(fee => (
               <tr key={fee.className} className="hover:bg-gray-50">
                 <td className="p-4 font-medium text-gray-900">{fee.className}</td>
                 {editingClass === fee.className ? (
                   <>
                     <td className="p-4 text-right">
                         <input 
                            className="border rounded px-2 py-1 w-24 text-right" 
                            type="number"
                            value={editForm.annualFee}
                            onChange={e => setEditForm({...editForm, annualFee: Number(e.target.value)})}
                         />
                     </td>
                     <td className="p-4 text-right">
                        <input 
                            className="border rounded px-2 py-1 w-24 text-right" 
                            type="number"
                            value={editForm.tuitionFee}
                            onChange={e => setEditForm({...editForm, tuitionFee: Number(e.target.value)})}
                         />
                     </td>
                     <td className="p-4 text-right font-bold">
                        ₹{Number(editForm.annualFee || 0) + Number(editForm.tuitionFee || 0)}
                     </td>
                     <td className="p-4 text-center">
                        <button onClick={handleSave} className="text-green-600 font-medium hover:underline mr-2">Save</button>
                        <button onClick={() => setEditingClass(null)} className="text-gray-500 font-medium hover:underline">Cancel</button>
                     </td>
                   </>
                 ) : (
                   <>
                     <td className="p-4 text-right text-gray-600">₹{fee.annualFee}</td>
                     <td className="p-4 text-right text-gray-600">₹{fee.tuitionFee}</td>
                     <td className="p-4 text-right font-bold text-gray-900">₹{fee.total}</td>
                     <td className="p-4 text-center">
                        <button 
                           onClick={() => handleEdit(fee)}
                           className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-sm font-medium"
                        >
                           Edit
                        </button>
                     </td>
                   </>
                 )}
               </tr>
             ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-4 p-2">
        Note: Changing fees here only updates the default fee structure for new students or when manually updating a student's fee profile. It does not retroactively change fees for existing students unless you edit the student directly.
      </p>
    </div>
  );
};

export default Fees;