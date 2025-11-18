
import { Student, FeeStructure, Payment, User } from '../types';

export const INITIAL_FEES: FeeStructure[] = [
  { className: 'LKG', tuitionFee: 10000, annualFee: 5000, total: 15000 },
  { className: 'UKG', tuitionFee: 10000, annualFee: 5000, total: 15000 },
  { className: '1', tuitionFee: 12000, annualFee: 6000, total: 18000 },
  { className: '2', tuitionFee: 12000, annualFee: 6000, total: 18000 },
  { className: '10', tuitionFee: 20000, annualFee: 8000, total: 28000 },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Principal', username: 'admin', password: '123', role: 'ADMIN' },
  { id: 'u2', name: 'Accountant', username: 'acct', password: '123', role: 'ACCOUNTANT' },
  { id: 'u3', name: 'Class Teacher', username: 'teacher', password: '123', role: 'TEACHER' },
  { id: 'u4', name: 'Parent User', username: 'parent', password: '123', role: 'PARENT' },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    admissionNumber: 'ADM001',
    name: 'Aarav Patel',
    fatherName: 'Suresh Patel',
    motherName: 'Geeta Patel',
    dob: '2018-05-15',
    className: '1',
    previousDues: [
      { year: '2023-24', amount: 2000, className: 'UKG' }
    ],
    currentYearFee: 18000,
    currentYearPaid: 0,
    isActive: true
  },
  {
    id: 's2',
    admissionNumber: 'ADM002',
    name: 'Diya Sharma',
    fatherName: 'Rohit Sharma',
    motherName: 'Anjali Sharma',
    dob: '2019-08-20',
    className: 'LKG',
    previousDues: [],
    currentYearFee: 15000,
    currentYearPaid: 5000,
    isActive: true
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    studentId: 's2',
    date: new Date().toISOString().split('T')[0],
    amount: 5000,
    method: 'UPI',
    allocations: [{ year: '2025-26', amount: 5000 }],
    recordedBy: { id: 'u1', name: 'Principal' },
    receiptNumber: 'REC-1001'
  }
];
