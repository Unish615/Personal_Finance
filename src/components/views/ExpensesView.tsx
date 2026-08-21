import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney, formatDate } from '../../utils/formatters';
import { TrendingDown, Plus, ArrowDownRight } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { transactions, categories, setIsAddTransactionModalOpen } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const expTxs = transactions.filter(t => t.type === 'expense');
  const totalExpense = expTxs.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Expense Tracker
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed log of day-to-day purchases, dining, housing, and shopping expenses.
          </p>
        </div>
        <Button
          onClick={() => setIsAddTransactionModalOpen(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Expense
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 text-white border-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-200">
          Total Recorded Expenses
        </span>
        <h2 className="text-3xl font-extrabold font-heading mt-1">
          {formatMoney(totalExpense, currency)}
        </h2>
        <p className="text-xs text-rose-200/80 mt-1">Across {expTxs.length} expense transactions</p>
      </Card>

      {expTxs.length === 0 ? (
        <EmptyState
          icon={<TrendingDown className="w-8 h-8 text-rose-500" />}
          title="No Expenses Recorded"
          description="Track your daily purchases to gain full clarity on your spending habits."
          actionLabel="Add Expense"
          onAction={() => setIsAddTransactionModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {expTxs.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            return (
              <Card key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                    <ArrowDownRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} size={12} />
                      <span>{cat?.name}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date, 'short')}</span>
                    </div>
                  </div>
                </div>

                <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  -{formatMoney(tx.amount, currency)}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
