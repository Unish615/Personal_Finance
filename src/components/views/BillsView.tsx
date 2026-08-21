import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney, formatDate, getRelativeDayString } from '../../utils/formatters';
import { BillStatus, Bill } from '../../types/finance';
import { CalendarClock, Plus, CheckCircle2, Edit3, Trash2, Bell, RefreshCw } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const BillsView: React.FC = () => {
  const { 
    bills, 
    categories, 
    markBillAsPaid, 
    deleteBill, 
    setEditingBill, 
    setIsAddBillModalOpen 
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [statusFilter, setStatusFilter] = useState<'all' | BillStatus>('all');
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

  const filteredBills = bills.filter(b => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Bills & Payment Reminders
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track utility bills, rent, subscriptions, and recurring payments ahead of time.
          </p>
        </div>
        <Button
          onClick={() => setIsAddBillModalOpen(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Bill Reminder
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-semibold">
        {[
          { id: 'all', label: 'All Bills' },
          { id: 'due_soon', label: 'Due Soon' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'paid', label: 'Paid' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as 'all' | BillStatus)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bills Cards Grid */}
      {filteredBills.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="w-8 h-8" />}
          title="No Bills Found"
          description="No upcoming bills. Add a bill to stay ahead of your payments."
          actionLabel="Add Bill"
          onAction={() => setIsAddBillModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map(bill => {
            const cat = categories.find(c => c.id === bill.categoryId);
            const rel = getRelativeDayString(bill.dueDate);
            const isPaid = bill.status === 'paid';

            return (
              <Card key={bill.id} className="p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {bill.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} size={12} />
                          <span>{cat?.name || 'Category'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingBill(bill);
                          setIsAddBillModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingBillId(bill.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bill Amount</span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        {formatMoney(bill.amount, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Due Date</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(bill.dueDate, 'medium')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Recurrence</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 text-slate-400" />
                        {bill.recurrence}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge
                    variant={
                      isPaid 
                        ? 'success' 
                        : rel.isOverdue 
                        ? 'danger' 
                        : rel.isDueSoon 
                        ? 'warning' 
                        : 'info'
                    }
                  >
                    {isPaid ? 'Paid' : rel.label}
                  </Badge>

                  {!isPaid && (
                    <Button
                      onClick={() => markBillAsPaid(bill.id)}
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {deletingBillId && (
        <Modal
          isOpen={!!deletingBillId}
          onClose={() => setDeletingBillId(null)}
          title="Delete Bill Reminder"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove this bill reminder from your schedule?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setDeletingBillId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteBill(deletingBillId);
                  setDeletingBillId(null);
                }}
              >
                Delete Bill
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
