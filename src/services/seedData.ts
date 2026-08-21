import { Category, Transaction, Budget, Bill, CurrencyCode } from '../types/finance';

export const DEFAULT_SYSTEM_CATEGORIES: Category[] = [
  // Income Categories
  { id: 'cat_sal', userId: 'system', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', isSystem: true },
  { id: 'cat_fre', userId: 'system', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#059669', isSystem: true },
  { id: 'cat_biz', userId: 'system', name: 'Business', type: 'income', icon: 'Building2', color: '#0d9488', isSystem: true },
  { id: 'cat_inv', userId: 'system', name: 'Investment', type: 'income', icon: 'TrendingUp', color: '#0284c7', isSystem: true },
  { id: 'cat_gft', userId: 'system', name: 'Gift', type: 'income', icon: 'Gift', color: '#38bdf8', isSystem: true },
  { id: 'cat_oth_inc', userId: 'system', name: 'Other Income', type: 'income', icon: 'PlusCircle', color: '#64748b', isSystem: true },

  // Expense Categories
  { id: 'cat_foo', userId: 'system', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f59e0b', isSystem: true },
  { id: 'cat_tra', userId: 'system', name: 'Transportation', type: 'expense', icon: 'Car', color: '#3b82f6', isSystem: true },
  { id: 'cat_hou', userId: 'system', name: 'Housing', type: 'expense', icon: 'Home', color: '#8b5cf6', isSystem: true },
  { id: 'cat_uti', userId: 'system', name: 'Utilities', type: 'expense', icon: 'Zap', color: '#f97316', isSystem: true },
  { id: 'cat_sho', userId: 'system', name: 'Shopping', type: 'expense', icon: 'ShoppingBag', color: '#f43f5e', isSystem: true },
  { id: 'cat_hea', userId: 'system', name: 'Healthcare', type: 'expense', icon: 'HeartPulse', color: '#ef4444', isSystem: true },
  { id: 'cat_edu', userId: 'system', name: 'Education', type: 'expense', icon: 'GraduationCap', color: '#6366f1', isSystem: true },
  { id: 'cat_ent', userId: 'system', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#a855f7', isSystem: true },
  { id: 'cat_trv', userId: 'system', name: 'Travel', type: 'expense', icon: 'Plane', color: '#06b6d4', isSystem: true },
  { id: 'cat_sub', userId: 'system', name: 'Subscriptions', type: 'expense', icon: 'CreditCard', color: '#ec4899', isSystem: true },
  { id: 'cat_per', userId: 'system', name: 'Personal Care', type: 'expense', icon: 'Sparkles', color: '#10b981', isSystem: true },
  { id: 'cat_fam', userId: 'system', name: 'Family', type: 'expense', icon: 'Users', color: '#eab308', isSystem: true },
  { id: 'cat_oth_exp', userId: 'system', name: 'Other', type: 'expense', icon: 'HelpCircle', color: '#64748b', isSystem: true },
];

export function generateSeedData(userId: string, currency: CurrencyCode = 'NPR') {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Format current and past dates
  const todayStr = `${currentYear}-${pad(currentMonth)}-${pad(Math.min(21, 28))}`;
  const day5Str = `${currentYear}-${pad(currentMonth)}-05`;
  const day8Str = `${currentYear}-${pad(currentMonth)}-08`;
  const day12Str = `${currentYear}-${pad(currentMonth)}-12`;
  const day15Str = `${currentYear}-${pad(currentMonth)}-15`;
  const day18Str = `${currentYear}-${pad(currentMonth)}-18`;
  
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const lastMonthDay1 = `${lastMonthYear}-${pad(lastMonth)}-01`;
  const lastMonthDay15 = `${lastMonthYear}-${pad(lastMonth)}-15`;

  const seedTransactions: Transaction[] = [
    {
      id: `tx_${userId}_1`,
      userId,
      categoryId: 'cat_sal',
      type: 'income',
      amount: 75000,
      currency,
      description: 'Monthly Salary Deposit',
      date: day5Str,
      paymentMethod: 'bank',
      account: 'Primary Bank Account',
      notes: 'Monthly tech consultant salary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_2`,
      userId,
      categoryId: 'cat_fre',
      type: 'income',
      amount: 18500,
      currency,
      description: 'UI/UX Design Contract Work',
      date: day12Str,
      paymentMethod: 'digital_wallet',
      account: 'Digital Wallet',
      notes: 'Mobile app design deliverables',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_3`,
      userId,
      categoryId: 'cat_hou',
      type: 'expense',
      amount: 18000,
      currency,
      description: 'Monthly Apartment Rent',
      date: day5Str,
      paymentMethod: 'bank',
      account: 'Primary Bank Account',
      notes: 'Paid via bank transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_4`,
      userId,
      categoryId: 'cat_foo',
      type: 'expense',
      amount: 8500,
      currency,
      description: 'Supermarket Groceries & Dining',
      date: day8Str,
      paymentMethod: 'debit_card',
      account: 'Debit Card',
      notes: 'Bhatbhateni Supermarket supplies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_5`,
      userId,
      categoryId: 'cat_tra',
      type: 'expense',
      amount: 4200,
      currency,
      description: 'Pathao & Taxi Rides',
      date: day15Str,
      paymentMethod: 'digital_wallet',
      account: 'Digital Wallet',
      notes: 'Weekly city commute',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_6`,
      userId,
      categoryId: 'cat_sho',
      type: 'expense',
      amount: 6800,
      currency,
      description: 'New Running Shoes',
      date: day18Str,
      paymentMethod: 'credit_card',
      account: 'Rewards Credit Card',
      notes: 'Bought during weekend sale',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_7`,
      userId,
      categoryId: 'cat_uti',
      type: 'expense',
      amount: 3500,
      currency,
      description: 'Electricity & High-speed Internet',
      date: day12Str,
      paymentMethod: 'digital_wallet',
      account: 'Digital Wallet',
      notes: 'NEA & Fiber Net',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_8`,
      userId,
      categoryId: 'cat_ent',
      type: 'expense',
      amount: 2100,
      currency,
      description: 'Cinema Tickets & Dinner',
      date: todayStr,
      paymentMethod: 'cash',
      account: 'Cash Wallet',
      notes: 'Weekend movie night',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Last month baseline transactions for trend comparisons
    {
      id: `tx_${userId}_9`,
      userId,
      categoryId: 'cat_sal',
      type: 'income',
      amount: 75000,
      currency,
      description: 'Previous Month Salary',
      date: lastMonthDay1,
      paymentMethod: 'bank',
      account: 'Primary Bank Account',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `tx_${userId}_10`,
      userId,
      categoryId: 'cat_foo',
      type: 'expense',
      amount: 9200,
      currency,
      description: 'Previous Month Food & Dining',
      date: lastMonthDay15,
      paymentMethod: 'debit_card',
      account: 'Debit Card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const seedBudgets: Budget[] = [
    {
      id: `bdg_${userId}_1`,
      userId,
      categoryId: 'cat_foo',
      amount: 12000,
      month: currentMonth,
      year: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `bdg_${userId}_2`,
      userId,
      categoryId: 'cat_tra',
      amount: 6000,
      month: currentMonth,
      year: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `bdg_${userId}_3`,
      userId,
      categoryId: 'cat_sho',
      amount: 8000,
      month: currentMonth,
      year: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `bdg_${userId}_4`,
      userId,
      categoryId: 'cat_hou',
      amount: 20000,
      month: currentMonth,
      year: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `bdg_${userId}_5`,
      userId,
      categoryId: 'cat_uti',
      amount: 4500,
      month: currentMonth,
      year: currentYear,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const seedBills: Bill[] = [
    {
      id: `bill_${userId}_1`,
      userId,
      name: 'High-speed Fiber Internet',
      amount: 2000,
      currency,
      categoryId: 'cat_uti',
      dueDate: `${currentYear}-${pad(currentMonth)}-${pad(Math.min(25, 28))}`,
      recurrence: 'monthly',
      reminderDays: 3,
      status: 'due_soon',
      notes: 'WorldLink / Vianet renewal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `bill_${userId}_2`,
      userId,
      name: 'Netflix & Spotify Premium',
      amount: 1500,
      currency,
      categoryId: 'cat_sub',
      dueDate: `${currentYear}-${pad(currentMonth)}-${pad(Math.min(28, 28))}`,
      recurrence: 'monthly',
      reminderDays: 1,
      status: 'upcoming',
      notes: 'Auto-debit from credit card',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `bill_${userId}_3`,
      userId,
      name: 'Apartment Maintenance & Water',
      amount: 3000,
      currency,
      categoryId: 'cat_hou',
      dueDate: `${currentYear}-${pad(currentMonth)}-02`,
      recurrence: 'monthly',
      reminderDays: 3,
      status: 'paid',
      lastPaidDate: day5Str,
      notes: 'Paid cash to building manager',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  return { seedTransactions, seedBudgets, seedBills };
}
