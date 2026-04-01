import type { Bill } from '@/types/expense';

export interface Company {
  id: string;
  name: string;
  companyName: string;
  ownerName: string;
  gstn: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  totalCredit: number;
  totalDebit: number;
  balance: number;
  bills: Bill[];
}
