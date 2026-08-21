import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { NotificationDrawer } from '../modals/NotificationDrawer';
import { Plus, Bell, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    unreadNotificationCount, 
    setIsAddTransactionModalOpen, 
    setIsAddBillModalOpen,
    setIsAddBudgetModalOpen 
  } = useFinance();

  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const tabTitles: Record<string, { title: string; desc: string }> = {
    dashboard: { title: 'Financial Overview', desc: `Welcome back, ${user?.name || 'User'}!` },
    transactions: { title: 'Transactions History', desc: 'Search, filter, and manage your income & expenses.' },
    income: { title: 'Income Tracker', desc: 'Monitor your salary, freelancing, and revenue streams.' },
    expenses: { title: 'Expense Tracker', desc: 'Understand where your money goes every day.' },
    budgets: { title: 'Monthly Budgets', desc: 'Stay within your spending targets and avoid overspending.' },
    bills: { title: 'Bills & Payment Reminders', desc: 'Never miss an upcoming bill or recurring subscription.' },
    analytics: { title: 'Financial Analytics & Insights', desc: 'Visual charts and deep insights into your net wealth.' },
    categories: { title: 'Category Management', desc: 'Customize icons, colors, and category rules.' },
    settings: { title: 'Application Settings', desc: 'Preferences, security, currencies, and data backups.' },
    profile: { title: 'User Profile', desc: 'Manage your personal account details.' },
  };

  const currentInfo = tabTitles[activeTab] || { title: 'Zenith Finance', desc: 'Personal Wealth Dashboard' };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between transition-colors">
        
        {/* Title & Subtitle */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading tracking-tight">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
            {currentInfo.desc}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Currency Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{user?.currency || 'NPR'}</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Quick Add Expense Action */}
          <Button
            onClick={() => setIsAddTransactionModalOpen(true)}
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </header>

      {/* In-app Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
