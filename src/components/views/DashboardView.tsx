import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { CategoryIcon } from '../ui/CategoryIcon';
import { formatMoney, formatDate, getRelativeDayString } from '../../utils/formatters';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Plus, 
  CalendarClock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    summaryMetrics, 
    transactions, 
    categories, 
    budgets, 
    bills, 
    insights, 
    timeframe, 
    setTimeframe,
    setIsAddTransactionModalOpen, 
    setIsAddBillModalOpen, 
    setIsAddBudgetModalOpen,
    markBillAsPaid,
    setActiveTab
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  // --- CHART DATA PREPARATION ---
  
  // 1. Income vs Expense Bar Chart Data
  const monthlyChartData = React.useMemo(() => {
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {};
    const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const now = new Date();
    // Build last 6 months list
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${monthsList[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      monthlyMap[key] = { month: label, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const d = new Date(t.date + 'T00:00:00');
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (monthlyMap[key]) {
        if (t.type === 'income') {
          monthlyMap[key].income += t.amount;
        } else {
          monthlyMap[key].expense += t.amount;
        }
      }
    });

    return Object.values(monthlyMap);
  }, [transactions]);

  // 2. Expense Category Donut Data
  const categoryDonutData = React.useMemo(() => {
    const expTxs = transactions.filter(t => t.type === 'expense');
    const catTotals: Record<string, number> = {};

    expTxs.forEach(t => {
      catTotals[t.categoryId] = (catTotals[t.categoryId] || 0) + t.amount;
    });

    const data = Object.entries(catTotals).map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Other',
        value: amount,
        color: cat?.color || '#64748b'
      };
    }).sort((a, b) => b.value - a.value);

    return data.slice(0, 6); // Top 6 categories
  }, [transactions, categories]);

  // 3. Upcoming Unpaid Bills (Top 3)
  const upcomingBills = React.useMemo(() => {
    return bills
      .filter(b => b.status !== 'paid')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  }, [bills]);

  // 4. Current Month Budget Meters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. TOP FINANCIAL SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Balance */}
        <Card className="p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Net Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
              {formatMoney(summaryMetrics.totalBalance, currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <Badge variant={summaryMetrics.balanceTrend >= 0 ? 'success' : 'danger'} size="sm">
                {summaryMetrics.balanceTrend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{Math.abs(summaryMetrics.balanceTrend)}%</span>
              </Badge>
              <span className="text-slate-500 dark:text-slate-400">vs last month</span>
            </div>
          </div>
        </Card>

        {/* Total Income */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
              {formatMoney(summaryMetrics.totalIncome, currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <Badge variant={summaryMetrics.incomeTrend >= 0 ? 'success' : 'warning'} size="sm">
                <span>{summaryMetrics.incomeTrend >= 0 ? '+' : ''}{summaryMetrics.incomeTrend}%</span>
              </Badge>
              <span className="text-slate-500 dark:text-slate-400">this month</span>
            </div>
          </div>
        </Card>

        {/* Total Expenses */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Expenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
              {formatMoney(summaryMetrics.totalExpenses, currency)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <Badge variant={summaryMetrics.expenseTrend <= 0 ? 'success' : 'danger'} size="sm">
                <span>{summaryMetrics.expenseTrend >= 0 ? '+' : ''}{summaryMetrics.expenseTrend}%</span>
              </Badge>
              <span className="text-slate-500 dark:text-slate-400">vs previous month</span>
            </div>
          </div>
        </Card>

        {/* Remaining Monthly Budget */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Budget Remaining
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
              {formatMoney(summaryMetrics.budgetRemaining, currency)}
            </h3>
            <div className="mt-1">
              <ProgressBar 
                percentage={summaryMetrics.totalBudget > 0 ? (summaryMetrics.totalExpenses / summaryMetrics.totalBudget) * 100 : 0} 
                height="sm" 
              />
            </div>
          </div>
        </Card>

      </div>

      {/* 2. PROMINENT QUICK ACTIONS BANNER */}
      <Card className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border-0 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h4 className="font-bold text-base font-heading">Quick Actions</h4>
              <p className="text-xs text-indigo-200">Instant shortcuts to manage your wealth.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={() => setIsAddTransactionModalOpen(true)}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Expense
            </Button>

            <Button
              onClick={() => {
                setIsAddTransactionModalOpen(true);
              }}
              variant="success"
              size="sm"
              icon={<TrendingUp className="w-4 h-4" />}
            >
              Add Income
            </Button>

            <Button
              onClick={() => setIsAddBillModalOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              icon={<CalendarClock className="w-4 h-4" />}
            >
              Add Bill
            </Button>

            <Button
              onClick={() => setIsAddBudgetModalOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              icon={<PiggyBank className="w-4 h-4" />}
            >
              Set Budget
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expense Bar Chart */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-heading">
                Income vs Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparison of revenue streams against spending across recent months.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(value: number | undefined) => [formatMoney(value || 0, currency), '']}
                />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Category Donut Chart */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-heading">
              Expense Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of spending by major category.
            </p>
          </div>

          {categoryDonutData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No expense data recorded yet.
            </div>
          ) : (
            <div className="my-4 flex items-center justify-center h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(value: number | undefined) => [formatMoney(value || 0, currency), 'Total']}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legend list */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {categoryDonutData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatMoney(item.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* 4. BUDGET OVERVIEW & UPCOMING BILLS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Budget Progress Meter */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-heading">
                Monthly Budget Health
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track how close you are to your expense limits.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('budgets')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {currentBudgets.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">No monthly budgets configured yet.</p>
              <button
                onClick={() => setIsAddBudgetModalOpen(true)}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Create Budget
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentBudgets.slice(0, 4).map(b => {
                const cat = categories.find(c => c.id === b.categoryId);
                const spent = transactions
                  .filter(t => t.categoryId === b.categoryId && t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const percent = (spent / b.amount) * 100;

                return (
                  <div key={b.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} size={16} />
                        <span className="text-slate-800 dark:text-slate-200">{cat?.name || 'Category'}</span>
                      </div>
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatMoney(spent, currency)} / {formatMoney(b.amount, currency)}
                      </span>
                    </div>
                    <ProgressBar percentage={percent} height="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming Bills Widget */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-heading">
                Upcoming Bills
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Never miss an impending utility or subscription bill.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingBills.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">No upcoming bills due right now.</p>
              <button
                onClick={() => setIsAddBillModalOpen(true)}
                className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                + Add Bill Reminder
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBills.map(bill => {
                const rel = getRelativeDayString(bill.dueDate);
                return (
                  <div 
                    key={bill.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
                        <CalendarClock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {bill.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                            {formatMoney(bill.amount, currency)}
                          </span>
                          <Badge 
                            variant={rel.isOverdue ? 'danger' : rel.isDueSoon ? 'warning' : 'info'}
                            size="sm"
                          >
                            {rel.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => markBillAsPaid(bill.id)}
                      variant="outline"
                      size="sm"
                    >
                      Mark Paid
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

      </div>

      {/* 5. FINANCIAL INSIGHTS BANNER */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Financial Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.slice(0, 2).map(ins => (
              <div
                key={ins.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                  ins.type === 'warning'
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
                    : ins.type === 'success'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-200'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {ins.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-xs">{ins.title}</h5>
                  <p className="mt-0.5 opacity-90 leading-relaxed">{ins.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
