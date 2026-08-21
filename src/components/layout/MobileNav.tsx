import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from '../../types/finance';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PiggyBank, 
  CalendarClock, 
  Menu, 
  X, 
  PieChart, 
  Tags, 
  Settings, 
  User, 
  TrendingUp, 
  TrendingDown,
  Plus
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddTransactionModalOpen } = useFinance();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions' as ActiveTab, label: 'Activity', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'budgets' as ActiveTab, label: 'Budgets', icon: <PiggyBank className="w-5 h-5" /> },
    { id: 'bills' as ActiveTab, label: 'Bills', icon: <CalendarClock className="w-5 h-5" /> },
  ];

  const drawerLinks = [
    { id: 'income' as ActiveTab, label: 'Income Details', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
    { id: 'expenses' as ActiveTab, label: 'Expense Details', icon: <TrendingDown className="w-5 h-5 text-rose-500" /> },
    { id: 'analytics' as ActiveTab, label: 'Analytics & Reports', icon: <PieChart className="w-5 h-5 text-sky-500" /> },
    { id: 'categories' as ActiveTab, label: 'Category Settings', icon: <Tags className="w-5 h-5" /> },
    { id: 'settings' as ActiveTab, label: 'Preferences & Security', icon: <Settings className="w-5 h-5" /> },
    { id: 'profile' as ActiveTab, label: 'My Account', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Bottom Sticky Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-lg">
        {mainTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsDrawerOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Center Quick Add Expense */}
        <button
          onClick={() => setIsAddTransactionModalOpen(true)}
          className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 -mt-5 border-2 border-white dark:border-slate-900 cursor-pointer"
          aria-label="Quick Add Expense"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-heading text-lg text-slate-900 dark:text-slate-100">
                    Navigation Menu
                  </span>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {drawerLinks.map(link => (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                        activeTab === link.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                Zenith Finance v1.0 • Isolated Local SaaS
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
