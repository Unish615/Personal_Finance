import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney } from '../../utils/formatters';
import { PiggyBank, Plus, Edit3, Trash2, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export const BudgetsView: React.FC = () => {
  const { 
    budgets, 
    categories, 
    transactions, 
    deleteBudget, 
    setEditingBudget, 
    setIsAddBudgetModalOpen,
    insights 
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [deletingBudgetId, setDeletingBudgetId] = React.useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Monthly Budget Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Set target spend thresholds per category to keep your finances strictly disciplined.
          </p>
        </div>
        <Button
          onClick={() => setIsAddBudgetModalOpen(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Create Budget
        </Button>
      </div>

      {/* Intelligence Cards */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map(ins => (
            <div
              key={ins.id}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                ins.type === 'warning'
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                  : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {ins.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-xs">{ins.title}</h4>
                <p className="mt-0.5 opacity-90 leading-relaxed">{ins.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Grid */}
      {currentBudgets.length === 0 ? (
        <EmptyState
          icon={<PiggyBank className="w-8 h-8" />}
          title="No Active Budgets"
          description="You haven't created a budget yet. Create your first budget to start tracking your spending."
          actionLabel="Create Budget"
          onAction={() => setIsAddBudgetModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentBudgets.map(b => {
            const cat = categories.find(c => c.id === b.categoryId);
            const spent = transactions
              .filter(t => t.categoryId === b.categoryId && t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);

            const remaining = b.amount - spent;
            const percent = (spent / b.amount) * 100;

            let statusVariant: 'success' | 'warning' | 'danger' = 'success';
            let statusLabel = 'Healthy';
            if (percent >= 100) {
              statusVariant = 'danger';
              statusLabel = 'Over Budget';
            } else if (percent >= 75) {
              statusVariant = 'warning';
              statusLabel = 'Approaching Limit';
            }

            return (
              <Card key={b.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                      <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {cat?.name || 'Category'}
                      </h4>
                      <Badge variant={statusVariant} size="sm" className="mt-0.5">
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBudget(b);
                        setIsAddBudgetModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Edit budget"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBudgetId(b.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Delete budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <ProgressBar percentage={percent} height="md" showLabel />
                  <div className="flex justify-between items-center text-xs pt-1 text-slate-500 dark:text-slate-400 font-medium">
                    <span>Spent: <strong className="text-slate-900 dark:text-slate-100">{formatMoney(spent, currency)}</strong></span>
                    <span>Remaining: <strong className={remaining < 0 ? 'text-rose-600 font-bold' : 'text-slate-900 dark:text-slate-100'}>{formatMoney(remaining, currency)}</strong></span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBudgetId && (
        <Modal
          isOpen={!!deletingBudgetId}
          onClose={() => setDeletingBudgetId(null)}
          title="Delete Budget"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove this monthly category budget limit?
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setDeletingBudgetId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteBudget(deletingBudgetId);
                  setDeletingBudgetId(null);
                }}
              >
                Delete Budget
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
