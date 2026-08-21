export type CurrencyCode = 'NPR' | 'USD' | 'EUR' | 'GBP' | 'INR';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NPR: { code: 'NPR', symbol: 'NPR ', name: 'Nepalese Rupee', locale: 'ne-NP' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
};

export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'cash' 
  | 'bank' 
  | 'credit_card' 
  | 'debit_card' 
  | 'digital_wallet' 
  | 'other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  onboarded: boolean;
  avatarUrl?: string;
  createdAt: string;
  monthlyIncomeGoal?: number;
  dateFormat?: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  theme?: 'light' | 'dark' | 'system';
}

export interface Category {
  id: string;
  userId: string; // 'system' or specific user ID
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  description: string;
  date: string; // ISO format string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  account?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string; // categoryId or 'total'
  amount: number;
  month: number; // 1 - 12
  year: number; // e.g. 2026
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceType = 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type BillStatus = 'upcoming' | 'due_soon' | 'overdue' | 'paid';
export type ReminderDays = 0 | 1 | 3 | 7;

export interface Bill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  recurrence: RecurrenceType;
  reminderDays: ReminderDays;
  status: BillStatus;
  lastPaidDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'bill_due' | 'bill_overdue' | 'budget_warning' | 'budget_exceeded' | 'summary';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  budgetRemaining: number;
  totalBudget: number;
  balanceTrend: number; // percentage vs last month
  incomeTrend: number;
  expenseTrend: number;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'transactions'
  | 'income'
  | 'expenses'
  | 'budgets'
  | 'bills'
  | 'analytics'
  | 'categories'
  | 'settings'
  | 'profile';
