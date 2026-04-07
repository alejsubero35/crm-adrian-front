import type { ApiAccount, ApiAccountTransaction } from "@/types/accounting";

export interface ApiExpenseCategory {
  id: number;
  name?: string;
  code?: number;
  slug?: string;
  note?: string;
  status?: number;
}

export interface ApiExpenseSubCategory {
  id: number;
  name?: string;
  code?: number;
  slug?: string;
  note?: string;
  status?: number;
  category?: ApiExpenseCategory;
}

export interface ApiExpense {
  id: number;
  reason?: string;
  slug?: string;
  category?: ApiExpenseCategory;
  subCategory?: ApiExpenseSubCategory;
  account?: ApiAccount;
  transaction?: ApiAccountTransaction;
  date?: string; // YYYY-MM-DD
  note?: string;
  status?: number;
  createdBy?: string;
  image?: string;
}

export interface CreateExpensePayload {
  reason: string;
  subCategory: { id: number; code: number };
  account: { id: number; availableBalance?: number };
  availableBalance: number;
  amount: number;
  date?: string;
  note?: string;
  chequeNo?: string;
  voucherNo?: string;
  status?: number;
}
