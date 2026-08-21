import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney, formatDate } from '../../utils/formatters';
import { TrendingUp, Plus, ArrowUpRight, Calendar } from 'lucide-react';

export const IncomeView: React.FC = () => {
  const { transactions, categories, setIsAddTransactionModalOpen } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const incomeTxs = transactions.filter(t => t.type === 'income');
  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Income Streams Tracker
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor salary deposits, freelancing invoices, investments, and gifts.
          </p>
        </div>
        <Button
          onClick={() => setIsAddTransactionModalOpen(true)}
          variant="success"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Income
        </Button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-emerald-900 to-slate-900 text-white border-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
          Total Recorded Income
        </span>
        <h2 className="text-3xl font-extrabold font-heading mt-1">
          {formatMoney(totalIncome, currency)}
        </h2>
        <p className="text-xs text-emerald-200/80 mt-1">Across {incomeTxs.length} revenue transactions</p>
      </Card>

      {incomeTxs.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
          title="No Income Recorded"
          description="Add your salary or freelance earnings to start building your cash balance."
          actionLabel="Add Income"
          onAction={() => setIsAddTransactionModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {incomeTxs.map(tx => {
            const cat = categories.find(c => c.id === tx.categoryId);
            return (
              <Card key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
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

                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  +{formatMoney(tx.amount, currency)}
                </span>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
