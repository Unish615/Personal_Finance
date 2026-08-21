import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Select } from '../ui/Select';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatMoney } from '../../utils/formatters';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { PieChart, TrendingUp, TrendingDown, PiggyBank, Award } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { transactions, categories } = useFinance();
  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [period, setPeriod] = useState<string>('6_months');

  // --- ANALYTICAL COMPUTATIONS ---

  // 1. Monthly Cumulative Savings Trend Area Chart
  const savingsTrendData = useMemo(() => {
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthsCount = period === '3_months' ? 3 : period === '12_months' ? 12 : 6;

    const list: { month: string; savings: number; income: number; expense: number }[] = [];
    let runningBalance = 0;

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth() + 1;
      const label = `${monthsList[d.getMonth()]} ${mYear.toString().slice(2)}`;

      const monthTxs = transactions.filter(t => {
        const txDate = new Date(t.date + 'T00:00:00');
        return txDate.getFullYear() === mYear && (txDate.getMonth() + 1) === mMonth;
      });

      const inc = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const net = inc - exp;
      runningBalance += net;

      list.push({
        month: label,
        income: inc,
        expense: exp,
        savings: runningBalance
      });
    }

    return list;
  }, [transactions, period]);

  // 2. Category Distribution
  const categoryData = useMemo(() => {
    const expTxs = transactions.filter(t => t.type === 'expense');
    const catMap: Record<string, number> = {};
    let totalExp = 0;

    expTxs.forEach(t => {
      catMap[t.categoryId] = (catMap[t.categoryId] || 0) + t.amount;
      totalExp += t.amount;
    });

    return Object.entries(catMap).map(([cId, amount]) => {
      const cat = categories.find(c => c.id === cId);
      const share = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
      return {
        id: cId,
        name: cat?.name || 'Other',
        color: cat?.color || '#64748b',
        icon: cat?.icon || 'Tag',
        amount,
        share
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // 3. Top 5 Largest Individual Expenses
  const topExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Financial Analytics & Reports
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual graphs, cash-flow trends, and deep category spending analysis.
          </p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            options={[
              { value: '3_months', label: 'Last 3 Months' },
              { value: '6_months', label: 'Last 6 Months' },
              { value: '12_months', label: 'Last 12 Months' },
            ]}
          />
        </div>
      </div>

      {/* Cumulative Net Savings Growth Chart */}
      <Card className="p-6 space-y-4">
        <div>
          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
            Cumulative Savings Accumulation
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Net wealth accumulation trajectory over the selected time horizon.
          </p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: number | undefined) => [formatMoney(value || 0, currency), 'Net Savings']}
              />
              <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorSavings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category Analysis Grid & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Share List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
              Category Expense Analysis
            </h4>
          </div>

          <div className="space-y-3">
            {categoryData.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No expense categories to display.</p>
            ) : (
              categoryData.map(cat => (
                <div key={cat.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat.icon} color={cat.color} size={16} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {formatMoney(cat.amount, currency)} ({cat.share}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.share}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top 5 Expenses List */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
              Top 5 Major Expenses
            </h4>
          </div>

          <div className="space-y-3">
            {topExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No major expense transactions recorded.</p>
            ) : (
              topExpenses.map((tx, idx) => {
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {tx.description}
                        </h5>
                        <span className="text-[10px] text-slate-400">
                          {cat?.name || 'Category'} • {tx.date}
                        </span>
                      </div>
                    </div>

                    <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {formatMoney(tx.amount, currency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Card>

      </div>

    </div>
  );
};
