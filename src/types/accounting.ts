export interface ApiAccount {
  id: number;
  slug?: string;
  bankName?: string;
  branchName?: string;
  accountNumber?: string;
  label?: string;
  availableBalance?: number;
  totalCredits?: number;
  totalDebits?: number;
  date?: string;
  note?: string;
  status?: number;
}

export interface CreateAccountPayload {
  bankName: string;
  branchName?: string;
  accountNumber: string;
  date?: string;
  note?: string;
  status?: number;
}

export interface ApiAccountTransaction {
  id: number;
  account?: ApiAccount;
  reason?: string;
  slug?: string;
  amount?: number;
  balance?: number;
  type?: number; // 1=credit, 0=debit
  transactionDate?: string; // YYYY-MM-DD
  note?: string;
  status?: number;
  user?: any;
}
