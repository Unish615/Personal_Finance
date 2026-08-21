import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { 
  Transaction, 
  Category, 
  Budget, 
  Bill, 
  NotificationItem, 
  UserProfile 
} from '../types/finance';
import { DEFAULT_SYSTEM_CATEGORIES } from '../services/seedData';

/**
 * Custom React JS Database Hook powered by Dexie.js useLiveQuery.
 * Automatically re-renders React components when IndexedDB records change.
 */
export function useDatabase(userId?: string) {
  // Live Reactive Queries
  const transactions = useLiveQuery(
    () => (userId ? db.transactions.where('userId').equals(userId).toArray() : []),
    [userId]
  ) || [];

  const budgets = useLiveQuery(
    () => (userId ? db.budgets.where('userId').equals(userId).toArray() : []),
    [userId]
  ) || [];

  const bills = useLiveQuery(
    () => (userId ? db.bills.where('userId').equals(userId).toArray() : []),
    [userId]
  ) || [];

  const customCategories = useLiveQuery(
    () => (userId ? db.categories.where('userId').equals(userId).toArray() : []),
    [userId]
  ) || [];

  const notifications = useLiveQuery(
    () => (userId ? db.notifications.where('userId').equals(userId).toArray() : []),
    [userId]
  ) || [];

  const categories = [...DEFAULT_SYSTEM_CATEGORIES, ...customCategories];

  // Database Mutation Methods
  const addTransaction = async (tx: Transaction) => {
    await db.transactions.put(tx);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    await db.transactions.update(id, updates);
  };

  const deleteTransaction = async (id: string) => {
    await db.transactions.delete(id);
  };

  const addBudget = async (budget: Budget) => {
    await db.budgets.put(budget);
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    await db.budgets.update(id, updates);
  };

  const deleteBudget = async (id: string) => {
    await db.budgets.delete(id);
  };

  const addBill = async (bill: Bill) => {
    await db.bills.put(bill);
  };

  const updateBill = async (id: string, updates: Partial<Bill>) => {
    await db.bills.update(id, updates);
  };

  const deleteBill = async (id: string) => {
    await db.bills.delete(id);
  };

  const addCategory = async (category: Category) => {
    await db.categories.put(category);
  };

  const deleteCategory = async (id: string) => {
    await db.categories.delete(id);
  };

  const markNotificationRead = async (id: string) => {
    await db.notifications.update(id, { read: true });
  };

  const clearAllNotifications = async () => {
    if (userId) {
      await db.notifications.where('userId').equals(userId).delete();
    }
  };

  return {
    db,
    transactions,
    budgets,
    bills,
    categories,
    notifications,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addBill,
    updateBill,
    deleteBill,
    addCategory,
    deleteCategory,
    markNotificationRead,
    clearAllNotifications
  };
}
