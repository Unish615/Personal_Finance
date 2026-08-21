import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  Transaction, 
  Category, 
  Budget, 
  Bill, 
  NotificationItem, 
  ActiveTab, 
  FinancialSummary, 
  FinancialInsight,
  CurrencyCode 
} from '../types/finance';
import { StorageService } from '../services/storage';
import { calculateBillStatus, getNextDueDate, generateBillNotifications } from '../services/billEngine';
import { useAuth } from './AuthContext';
import { useDatabase } from '../hooks/useDatabase';

export type TimeframePeriod = 
  | 'this_week' 
  | 'this_month' 
  | 'last_month' 
  | 'last_3_months' 
  | 'last_6_months' 
  | 'this_year' 
  | 'all';

interface FinanceContextType {
  // Navigation & View State
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  timeframe: TimeframePeriod;
  setTimeframe: (tf: TimeframePeriod) => void;

  // Data Collections (Live React Database State)
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  bills: Bill[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;

  // Metrics & AI Insights
  summaryMetrics: FinancialSummary;
  insights: FinancialInsight[];

  // Quick Action Modal States
  isAddTransactionModalOpen: boolean;
  setIsAddTransactionModalOpen: (open: boolean) => void;
  isAddBillModalOpen: boolean;
  setIsAddBillModalOpen: (open: boolean) => void;
  isAddBudgetModalOpen: boolean;
  setIsAddBudgetModalOpen: (open: boolean) => void;
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  editingBill: Bill | null;
  setEditingBill: (bill: Bill | null) => void;
  editingBudget: Budget | null;
  setEditingBudget: (b: Budget | null) => void;

  // CRUD Operations
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addBudget: (b: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addBill: (bill: Omit<Bill, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (billId: string) => void;

  addCategory: (cat: Omit<Category, 'id' | 'userId'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string, reassignCategoryId?: string) => boolean;

  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Data reset
  resetDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const currency: CurrencyCode = user?.currency || 'NPR';

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [timeframe, setTimeframe] = useState<TimeframePeriod>('this_month');

  // React JS Database Hook (Dexie live queries)
  const dbHook = useDatabase(userId);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Sync React DB Hook to local state
  useEffect(() => {
    if (!userId) return;

    StorageService.initializeUserData(userId, currency);

    const txs = dbHook.transactions.length > 0 ? dbHook.transactions : StorageService.getTransactions(userId);
    const cats = dbHook.categories.length > 0 ? dbHook.categories : StorageService.getCategories(userId);
    const bdgs = dbHook.budgets.length > 0 ? dbHook.budgets : StorageService.getBudgets(userId);
    const blls = dbHook.bills.length > 0 ? dbHook.bills : StorageService.getBills(userId);
    const notifs = dbHook.notifications.length > 0 ? dbHook.notifications : StorageService.getNotifications(userId);

    const updatedBills = blls.map(b => ({
      ...b,
      status: calculateBillStatus(b)
    }));

    const newBillNotifs = generateBillNotifications(updatedBills, notifs);
    const mergedNotifs = [...newBillNotifs, ...notifs];

    setTransactions(txs);
    setCategories(cats);
    setBudgets(bdgs);
    setBills(updatedBills);
    setNotifications(mergedNotifs);
  }, [userId, currency, dbHook.transactions, dbHook.budgets, dbHook.bills, dbHook.categories, dbHook.notifications]);

  // Sync state changes to storage & React JS database
  const saveTxs = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    if (userId) StorageService.saveTransactions(userId, newTxs);
  };

  const saveCats = (newCats: Category[]) => {
    setCategories(newCats);
    if (userId) StorageService.saveCustomCategories(userId, newCats);
  };

  const saveBdgs = (newBdgs: Budget[]) => {
    setBudgets(newBdgs);
    if (userId) StorageService.saveBudgets(userId, newBdgs);
  };

  const saveBlls = (newBlls: Bill[]) => {
    setBills(newBlls);
    if (userId) StorageService.saveBills(userId, newBlls);
  };

  const saveNotifs = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    if (userId) StorageService.saveNotifications(userId, newNotifs);
  };

  // --- CRUD TRANSACTIONS ---
  const addTransaction = (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}`,
      userId,
      createdAt: now,
      updatedAt: now
    };
    saveTxs([newTx, ...transactions]);
    dbHook.addTransaction(newTx);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    saveTxs(updated);
    dbHook.updateTransaction(id, updates);
  };

  const deleteTransaction = (id: string) => {
    saveTxs(transactions.filter(t => t.id !== id));
    dbHook.deleteTransaction(id);
  };

  // --- CRUD BUDGETS ---
  const addBudget = (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const newBdg: Budget = {
      ...data,
      id: `bdg_${Date.now()}`,
      userId,
      createdAt: now,
      updatedAt: now
    };
    saveBdgs([newBdg, ...budgets]);
    dbHook.addBudget(newBdg);
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    const updated = budgets.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b);
    saveBdgs(updated);
    dbHook.updateBudget(id, updates);
  };

  const deleteBudget = (id: string) => {
    saveBdgs(budgets.filter(b => b.id !== id));
    dbHook.deleteBudget(id);
  };

  // --- CRUD BILLS ---
  const addBill = (data: Omit<Bill, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => {
    if (!userId) return;
    const now = new Date().toISOString();
    const tempBill: Bill = {
      ...data,
      id: `bill_${Date.now()}`,
      userId,
      status: 'upcoming',
      createdAt: now,
      updatedAt: now
    };
    tempBill.status = calculateBillStatus(tempBill);
    saveBlls([tempBill, ...bills]);
    dbHook.addBill(tempBill);
  };

  const updateBill = (id: string, updates: Partial<Bill>) => {
    const updated = bills.map(b => {
      if (b.id === id) {
        const merged = { ...b, ...updates, updatedAt: new Date().toISOString() };
        merged.status = calculateBillStatus(merged);
        return merged;
      }
      return b;
    });
    saveBlls(updated);
    dbHook.updateBill(id, updates);
  };

  const deleteBill = (id: string) => {
    saveBlls(bills.filter(b => b.id !== id));
    dbHook.deleteBill(id);
  };

  const markBillAsPaid = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    const todayStr = new Date().toISOString().split('T')[0];

    addTransaction({
      categoryId: bill.categoryId,
      type: 'expense',
      amount: bill.amount,
      currency: bill.currency,
      description: `Bill Payment: ${bill.name}`,
      date: todayStr,
      paymentMethod: 'bank',
      notes: `Automated transaction from bill pay: ${bill.name}`
    });

    if (bill.recurrence !== 'one-time') {
      const nextDue = getNextDueDate(bill.dueDate, bill.recurrence);
      updateBill(billId, {
        dueDate: nextDue,
        status: 'upcoming',
        lastPaidDate: todayStr
      });
    } else {
      updateBill(billId, {
        status: 'paid',
        lastPaidDate: todayStr
      });
    }
  };

  // --- CRUD CATEGORIES ---
  const addCategory = (data: Omit<Category, 'id' | 'userId'>) => {
    if (!userId) return;
    const newCat: Category = {
      ...data,
      id: `cat_custom_${Date.now()}`,
      userId,
      isSystem: false
    };
    saveCats([...categories, newCat]);
    dbHook.addCategory(newCat);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    saveCats(categories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string, reassignCategoryId?: string): boolean => {
    const count = transactions.filter(t => t.categoryId === id).length;

    if (count > 0 && !reassignCategoryId) {
      return false;
    }

    if (count > 0 && reassignCategoryId) {
      const remappedTxs = transactions.map(t => t.categoryId === id ? { ...t, categoryId: reassignCategoryId } : t);
      saveTxs(remappedTxs);

      const remappedBdgs = budgets.map(b => b.categoryId === id ? { ...b, categoryId: reassignCategoryId } : b);
      saveBdgs(remappedBdgs);
    }

    saveCats(categories.filter(c => c.id !== id));
    dbHook.deleteCategory(id);
    return true;
  };

  // --- NOTIFICATIONS ---
  const markNotificationRead = (id: string) => {
    saveNotifs(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    dbHook.markNotificationRead(id);
  };

  const clearAllNotifications = () => {
    saveNotifs([]);
    dbHook.clearAllNotifications();
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // --- RESET DEMO DATA ---
  const resetDemoData = () => {
    if (!userId) return;
    StorageService.clearUserData(userId);
    StorageService.initializeUserData(userId, currency);
    setTransactions([]);
    setCategories(StorageService.getCategories(userId));
    setBudgets([]);
    setBills([]);
    setNotifications([]);
  };

  // --- CALCULATE SUMMARY METRICS & INSIGHTS ---
  const summaryMetrics: FinancialSummary = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthTxs = transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
    });

    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const lastMonthTxs = transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === lastMonthYear && (d.getMonth() + 1) === lastMonth;
    });

    const currentIncome = currentMonthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastIncome = lastMonthTxs
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastExpenses = lastMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAllIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalAllExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalBalance = totalAllIncome - totalAllExpenses;

    const netSavings = currentIncome - currentExpenses;

    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
    const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + b.amount, 0);
    const budgetRemaining = totalBudget > 0 ? totalBudget - currentExpenses : 0;

    const incomeTrend = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseTrend = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
    const balanceTrend = (lastIncome - lastExpenses) > 0 
      ? ((netSavings - (lastIncome - lastExpenses)) / Math.abs(lastIncome - lastExpenses)) * 100 
      : 0;

    return {
      totalBalance,
      totalIncome: currentIncome,
      totalExpenses: currentExpenses,
      netSavings,
      budgetRemaining,
      totalBudget,
      balanceTrend: Math.round(balanceTrend * 10) / 10,
      incomeTrend: Math.round(incomeTrend * 10) / 10,
      expenseTrend: Math.round(expenseTrend * 10) / 10,
    };
  }, [transactions, budgets]);

  const insights: FinancialInsight[] = useMemo(() => {
    const list: FinancialInsight[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);
    for (const b of currentMonthBudgets) {
      const cat = categories.find(c => c.id === b.categoryId);
      if (!cat) continue;

      const spent = transactions
        .filter(t => t.categoryId === b.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const percent = Math.round((spent / b.amount) * 100);
      if (percent >= 100) {
        list.push({
          id: `ins_bdg_over_${b.id}`,
          type: 'warning',
          title: `Over Budget in ${cat.name}`,
          message: `You have exceeded your ${cat.name} budget by ${percent - 100}% (${spent.toLocaleString()} spent of ${b.amount.toLocaleString()} limit).`
        });
      } else if (percent >= 75) {
        list.push({
          id: `ins_bdg_warn_${b.id}`,
          type: 'warning',
          title: `Budget Limit Approaching`,
          message: `You have used ${percent}% of your ${cat.name} monthly budget.`
        });
      }
    }

    const expTxs = transactions.filter(t => t.type === 'expense');
    if (expTxs.length > 0) {
      const catTotals: Record<string, number> = {};
      expTxs.forEach(t => {
        catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
      });

      let maxCatId = '';
      let maxAmount = 0;
      for (const [cId, amt] of Object.entries(catTotals)) {
        if (amt > maxAmount) {
          maxAmount = amt;
          maxCatId = cId;
        }
      }

      const topCat = categories.find(c => c.id === maxCatId);
      if (topCat) {
        list.push({
          id: 'ins_top_cat',
          type: 'info',
          title: `Largest Spending Category`,
          message: `Your largest expense area is ${topCat.name} (${currency} ${maxAmount.toLocaleString()}).`
        });
      }
    }

    if (summaryMetrics.netSavings > 0) {
      list.push({
        id: 'ins_savings_positive',
        type: 'success',
        title: `Positive Monthly Cash Flow`,
        message: `Great job! You are saving ${currency} ${summaryMetrics.netSavings.toLocaleString()} this month.`
      });
    }

    return list;
  }, [budgets, categories, transactions, summaryMetrics, currency]);

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        timeframe,
        setTimeframe,
        transactions,
        categories,
        budgets,
        bills,
        notifications,
        unreadNotificationCount,
        summaryMetrics,
        insights,
        isAddTransactionModalOpen,
        setIsAddTransactionModalOpen,
        isAddBillModalOpen,
        setIsAddBillModalOpen,
        isAddBudgetModalOpen,
        setIsAddBudgetModalOpen,
        isAddCategoryModalOpen,
        setIsAddCategoryModalOpen,
        editingTransaction,
        setEditingTransaction,
        editingBill,
        setEditingBill,
        editingBudget,
        setEditingBudget,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        addBill,
        updateBill,
        deleteBill,
        markBillAsPaid,
        addCategory,
        updateCategory,
        deleteCategory,
        markNotificationRead,
        clearAllNotifications,
        resetDemoData
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};
