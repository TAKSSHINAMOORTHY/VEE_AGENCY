export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Transaction {
  id: string;
  billId?: string;
  date: string;
  particular: string;
  credit: number;
  debit: number;
  note?: string;
}

export interface Bill {
  id: string;
  companyId: string;
  billName: string;
  billNumber: string;
  totalAmount: number;
  totalCredit: number;
  totalDebit: number;
  balance: number;
  status: 'paid' | 'pending' | 'completed';
  createdDate: string;
  dueDate: string;
  transactions: Transaction[];

  // Legacy aliases kept for compatibility with existing pages/components.
  billNo: string;
  name?: string;
  billAmount: number;
  paid: number;
  dateCreated: string;
  payments: Payment[];
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export type ExpenseCategory = string;
