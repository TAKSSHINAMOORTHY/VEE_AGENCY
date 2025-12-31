import { Bill, Expense } from '@/types/expense';

export const mockBills: Bill[] = [
  {
    id: '1',
    billNo: 'BILL-001',
    name: 'Office Supplies',
    billAmount: 2500,
    paid: 2500,
    balance: 0,
    status: 'completed',
    dateCreated: '2024-12-15',
    payments: [
      { id: 'p1', amount: 1500, date: '2024-12-20', note: 'Initial payment' },
      { id: 'p2', amount: 1000, date: '2024-12-28', note: 'Final payment' },
    ],
  },
  {
    id: '2',
    billNo: 'BILL-002',
    name: 'Software License',
    billAmount: 5000,
    paid: 3000,
    balance: 2000,
    status: 'pending',
    dateCreated: '2024-12-18',
    payments: [
      { id: 'p3', amount: 3000, date: '2024-12-22', note: 'Partial payment' },
    ],
  },
  {
    id: '3',
    billNo: 'BILL-003',
    name: 'Marketing Campaign',
    billAmount: 8000,
    paid: 2000,
    balance: 6000,
    status: 'pending',
    dateCreated: '2024-12-20',
    payments: [
      { id: 'p4', amount: 2000, date: '2024-12-25', note: 'Deposit' },
    ],
  },
  {
    id: '4',
    billNo: 'BILL-004',
    name: 'Equipment Purchase',
    billAmount: 15000,
    paid: 15000,
    balance: 0,
    status: 'completed',
    dateCreated: '2024-12-10',
    payments: [
      { id: 'p5', amount: 5000, date: '2024-12-12', note: 'First installment' },
      { id: 'p6', amount: 5000, date: '2024-12-18', note: 'Second installment' },
      { id: 'p7', amount: 5000, date: '2024-12-24', note: 'Final installment' },
    ],
  },
  {
    id: '5',
    billNo: 'BILL-005',
    name: 'Consulting Services',
    billAmount: 3500,
    paid: 0,
    balance: 3500,
    status: 'pending',
    dateCreated: '2024-12-28',
    payments: [],
  },
];

export const mockExpenses: Expense[] = [
  { id: 'e1', category: 'Food & Dining', description: 'Team lunch', amount: 85, date: '2024-12-28' },
  { id: 'e2', category: 'Transportation', description: 'Uber to meeting', amount: 25, date: '2024-12-27' },
  { id: 'e3', category: 'Shopping', description: 'New keyboard', amount: 150, date: '2024-12-26' },
  { id: 'e4', category: 'Entertainment', description: 'Netflix subscription', amount: 15, date: '2024-12-25' },
  { id: 'e5', category: 'Bills & Utilities', description: 'Phone bill', amount: 75, date: '2024-12-24' },
  { id: 'e6', category: 'Healthcare', description: 'Pharmacy', amount: 45, date: '2024-12-23' },
  { id: 'e7', category: 'Food & Dining', description: 'Groceries', amount: 120, date: '2024-12-22' },
  { id: 'e8', category: 'Transportation', description: 'Gas', amount: 55, date: '2024-12-21' },
  { id: 'e9', category: 'Shopping', description: 'Office chair', amount: 250, date: '2024-12-20' },
  { id: 'e10', category: 'Travel', description: 'Flight booking', amount: 350, date: '2024-12-19' },
];

export const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Other',
] as const;
