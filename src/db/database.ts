import Dexie, { Table } from 'dexie';
import { 
  UserProfile, 
  Transaction, 
  Category, 
  Budget, 
  Bill, 
  NotificationItem 
} from '../types/finance';

export class FinanceDatabase extends Dexie {
  users!: Table<UserProfile, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  bills!: Table<Bill, string>;
  notifications!: Table<NotificationItem, string>;

  constructor() {
    super('ZenithFinanceDB');
    
    // Define Database Schema & Indexes (Requirement #25)
    this.version(1).stores({
      users: 'id, email',
      categories: 'id, userId, type, name',
      transactions: 'id, userId, categoryId, type, date, paymentMethod',
      budgets: 'id, userId, categoryId, [month+year]',
      bills: 'id, userId, categoryId, dueDate, status',
      notifications: 'id, userId, read, type, createdAt'
    });
  }
}

export const db = new FinanceDatabase();
