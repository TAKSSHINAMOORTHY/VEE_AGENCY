export interface Bill {
  id: string;
  billNo: string;
  name?: string;
  billAmount: number;
  paid: number;
  balance: number;
  status: 'paid' | 'pending' | 'completed';
  dateCreated: string;
  dueDate: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export type ExpenseCategory = string;
