
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, FeeStructure, Payment, User, PendingDue, PaymentAllocation } from '../types';
import { INITIAL_FEES, INITIAL_STUDENTS, INITIAL_PAYMENTS, INITIAL_USERS } from '../services/mockData';

interface AppContextType {
  user: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  users: User[];
  students: Student[];
  fees: FeeStructure[];
  payments: Payment[];
  saveUser: (user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  updateFeeStructure: (fee: FeeStructure) => void;
  recordPayment: (payment: Omit<Payment, 'id' | 'receiptNumber'>) => void;
  getStudentBalance: (studentId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Initialize state from localStorage or fall back to mocks
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [fees, setFees] = useState<FeeStructure[]>(() => {
    const saved = localStorage.getItem('fees');
    return saved ? JSON.parse(saved) : INITIAL_FEES;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  // Persistence effects
  useEffect(() => localStorage.setItem('users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('fees', JSON.stringify(fees)), [fees]);
  useEffect(() => localStorage.setItem('payments', JSON.stringify(payments)), [payments]);

  const login = (username: string, password?: string) => {
    // In a real app, verify password. Here, we simulate check.
    const found = users.find(u => u.username === username);
    if (found) {
        // Simple password check (mock)
        if (password && found.password && password !== found.password) {
            return false;
        }
        setUser(found);
        return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const saveUser = (userData: Partial<User>) => {
    if (userData.id) {
        // Update
        setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } as User : u));
    } else {
        // Create
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: userData.name || '',
            username: userData.username || '',
            role: userData.role || 'TEACHER',
            password: userData.password || '123' // Default if missing
        };
        setUsers([...users, newUser]);
    }
  };

  const deleteUser = (id: string) => {
      setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...studentData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setStudents([...students, newStudent]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const updateFeeStructure = (newFee: FeeStructure) => {
    setFees(prev => {
      const exists = prev.find(f => f.className === newFee.className);
      if (exists) {
        return prev.map(f => f.className === newFee.className ? newFee : f);
      }
      return [...prev, newFee];
    });
  };

  const recordPayment = (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Math.random().toString(36).substr(2, 9),
      receiptNumber: `REC-${1000 + payments.length + 1}`
    };

    setPayments([...payments, newPayment]);

    // Update student balances immediately
    const student = students.find(s => s.id === paymentData.studentId);
    if (student) {
      let updatedPreviousDues = [...student.previousDues];
      let updatedCurrentPaid = student.currentYearPaid;

      // The allocation array contains the distribution of (Amount Paid + Discount)
      paymentData.allocations.forEach(alloc => {
        if (alloc.year === '2025-26') {
          updatedCurrentPaid += alloc.amount;
        } else {
          updatedPreviousDues = updatedPreviousDues.map(due => {
            if (due.year === alloc.year) {
              // Reduce the pending due by the allocated amount
              return { ...due, amount: due.amount - alloc.amount };
            }
            return due;
          });
        }
      });

      updateStudent(student.id, {
        previousDues: updatedPreviousDues,
        currentYearPaid: updatedCurrentPaid
      });
    }
  };

  const getStudentBalance = (studentId: string) => {
    const s = students.find(st => st.id === studentId);
    if (!s) return 0;
    const prevTotal = s.previousDues.reduce((sum, d) => sum + d.amount, 0);
    const currentOutstanding = s.currentYearFee - s.currentYearPaid;
    return prevTotal + currentOutstanding;
  };

  return (
    <AppContext.Provider value={{
      user, login, logout, users, students, fees, payments,
      saveUser, deleteUser,
      addStudent, updateStudent, deleteStudent, updateFeeStructure, recordPayment, getStudentBalance
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};