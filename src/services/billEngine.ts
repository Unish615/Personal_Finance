import { Bill, RecurrenceType, NotificationItem } from '../types/finance';
import { formatDate } from '../utils/formatters';

export function calculateBillStatus(bill: Bill): 'upcoming' | 'due_soon' | 'overdue' | 'paid' {
  if (bill.status === 'paid') return 'paid';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(bill.dueDate + 'T00:00:00');
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'due_soon';
  return 'upcoming';
}

export function getNextDueDate(currentDueDateStr: string, recurrence: RecurrenceType): string {
  const current = new Date(currentDueDateStr + 'T00:00:00');
  const next = new Date(current);

  switch (recurrence) {
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    case 'one-time':
    default:
      return currentDueDateStr;
  }

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}

export function generateBillNotifications(bills: Bill[], existingNotifications: NotificationItem[]): NotificationItem[] {
  const newNotifications: NotificationItem[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  for (const bill of bills) {
    if (bill.status === 'paid') continue;

    const status = calculateBillStatus(bill);

    if (status === 'overdue') {
      const exists = existingNotifications.some(
        n => n.type === 'bill_overdue' && n.title.includes(bill.name) && n.createdAt.startsWith(todayStr)
      );
      if (!exists) {
        newNotifications.push({
          id: `notif_bill_overdue_${bill.id}_${Date.now()}`,
          userId: bill.userId,
          type: 'bill_overdue',
          title: `Overdue Bill: ${bill.name}`,
          message: `Your payment of ${bill.currency} ${bill.amount.toLocaleString()} was due on ${formatDate(bill.dueDate)}. Please pay promptly.`,
          read: false,
          createdAt: new Date().toISOString(),
          link: 'bills'
        });
      }
    } else if (status === 'due_soon') {
      const exists = existingNotifications.some(
        n => n.type === 'bill_due' && n.title.includes(bill.name) && n.createdAt.startsWith(todayStr)
      );
      if (!exists) {
        newNotifications.push({
          id: `notif_bill_due_${bill.id}_${Date.now()}`,
          userId: bill.userId,
          type: 'bill_due',
          title: `Upcoming Bill Due: ${bill.name}`,
          message: `Your payment of ${bill.currency} ${bill.amount.toLocaleString()} is due on ${formatDate(bill.dueDate)}.`,
          read: false,
          createdAt: new Date().toISOString(),
          link: 'bills'
        });
      }
    }
  }

  return newNotifications;
}
