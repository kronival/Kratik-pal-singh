
export type UserRole = 'ADMIN' | 'ACCOUNTANT' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string; // Optional for security in frontend state, but used in mock DB
}

export interface FeeStructure {
  className: string;
  tuitionFee: number;
  annualFee: number;
  total: number;
}

export interface PendingDue {
  year: string; // e.g., "2023-24"
  amount: number;
  className?: string; // Track which class this due belongs to
  description?: string;
}

export interface Student {
  id: string;
  admissionNumber: string;
  name: string;
  fatherName: string;
  motherName: string;
  dob: string;
  className: string;
  // Historical pending dues (previous years)
  previousDues: PendingDue[]; 
  // Current year fee configuration snapshot
  currentYearFee: number;
  currentYearPaid: number;
  isActive: boolean;
}

export interface PaymentAllocation {
  year: string; // "2025-26" for current, or specific previous year
  amount: number;
}

export interface Payment {
  id: string;
  studentId: string;
  date: string;
  amount: number;
  method: 'CASH' | 'UPI' | 'CHEQUE' | 'CARD';
  allocations: PaymentAllocation[];
  recordedBy: {
    id: string;
    name: string;
  };
  receiptNumber: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalOutstanding: number;
  collectedToday: number;
  collectedMonth: number;
}
