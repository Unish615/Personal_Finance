import { 
  UserProfile, 
  Transaction, 
  Category, 
  Budget, 
  Bill, 
  NotificationItem, 
  CurrencyCode 
} from '../types/finance';
import { DEFAULT_SYSTEM_CATEGORIES } from './seedData';

const CURRENT_USER_KEY = 'zenith_current_user_id';
const USERS_LIST_KEY = 'zenith_registered_users';

export class StorageService {
  // --- USER AUTH & PROFILES ---

  static getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveUsers(users: UserProfile[]): void {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
  }

  static getCurrentUserId(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
  }

  static setCurrentUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }

  static getUserProfile(userId: string): UserProfile | null {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  static saveUserProfile(profile: UserProfile): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === profile.id);
    if (index >= 0) {
      users[index] = profile;
    } else {
      users.push(profile);
    }
    this.saveUsers(users);
  }

  // --- ISOLATED DATA KEYS ---
  private static getKey(userId: string, entity: string): string {
    return `zenith_user_${userId}_${entity}`;
  }

  // --- CATEGORIES ---
  static getCategories(userId: string): Category[] {
    const customKey = this.getKey(userId, 'categories');
    let customCats: Category[] = [];
    try {
      const data = localStorage.getItem(customKey);
      if (data) customCats = JSON.parse(data);
    } catch {
      customCats = [];
    }
    return [...DEFAULT_SYSTEM_CATEGORIES, ...customCats];
  }

  static saveCustomCategories(userId: string, customCategories: Category[]): void {
    const customKey = this.getKey(userId, 'categories');
    // Store only custom non-system categories
    const onlyCustom = customCategories.filter(c => !c.isSystem);
    localStorage.setItem(customKey, JSON.stringify(onlyCustom));
  }

  // --- TRANSACTIONS ---
  static getTransactions(userId: string): Transaction[] {
    const key = this.getKey(userId, 'transactions');
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveTransactions(userId: string, transactions: Transaction[]): void {
    const key = this.getKey(userId, 'transactions');
    localStorage.setItem(key, JSON.stringify(transactions));
  }

  // --- BUDGETS ---
  static getBudgets(userId: string): Budget[] {
    const key = this.getKey(userId, 'budgets');
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveBudgets(userId: string, budgets: Budget[]): void {
    const key = this.getKey(userId, 'budgets');
    localStorage.setItem(key, JSON.stringify(budgets));
  }

  // --- BILLS ---
  static getBills(userId: string): Bill[] {
    const key = this.getKey(userId, 'bills');
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveBills(userId: string, bills: Bill[]): void {
    const key = this.getKey(userId, 'bills');
    localStorage.setItem(key, JSON.stringify(bills));
  }

  // --- NOTIFICATIONS ---
  static getNotifications(userId: string): NotificationItem[] {
    const key = this.getKey(userId, 'notifications');
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveNotifications(userId: string, notifications: NotificationItem[]): void {
    const key = this.getKey(userId, 'notifications');
    localStorage.setItem(key, JSON.stringify(notifications));
  }

  // --- CLEAN DATA INITIALIZATION (0 DEFAULT MOCK TRANSACTIONS) ---
  static initializeUserData(userId: string, currency: CurrencyCode = 'NPR'): void {
    const initKey = this.getKey(userId, 'initialized');
    if (!localStorage.getItem(initKey)) {
      localStorage.setItem(initKey, 'true');
      this.saveTransactions(userId, []);
      this.saveBudgets(userId, []);
      this.saveBills(userId, []);
    }
  }

  // --- CLEAR / RESET DATA ---
  static clearUserData(userId: string): void {
    localStorage.removeItem(this.getKey(userId, 'initialized'));
    localStorage.removeItem(this.getKey(userId, 'categories'));
    localStorage.removeItem(this.getKey(userId, 'transactions'));
    localStorage.removeItem(this.getKey(userId, 'budgets'));
    localStorage.removeItem(this.getKey(userId, 'bills'));
    localStorage.removeItem(this.getKey(userId, 'notifications'));
    this.saveTransactions(userId, []);
    this.saveBudgets(userId, []);
    this.saveBills(userId, []);
    this.saveNotifications(userId, []);
  }

  // --- EXPORT & IMPORT ---
  static exportUserDataJSON(userId: string): string {
    const profile = this.getUserProfile(userId);
    const categories = this.getCategories(userId);
    const transactions = this.getTransactions(userId);
    const budgets = this.getBudgets(userId);
    const bills = this.getBills(userId);

    const exportObject = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      categories,
      transactions,
      budgets,
      bills,
    };

    return JSON.stringify(exportObject, null, 2);
  }
}
