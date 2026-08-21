import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from '../../types/finance';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CalendarClock, 
  PieChart, 
  Tags, 
  Settings, 
  User, 
  Sun, 
  Moon, 
  LogOut,
  ChevronUp,
  UserCheck
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();
  const { user, logout, switchUser, demoUsers } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'income', label: 'Income', icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
    { id: 'expenses', label: 'Expenses', icon: <TrendingDown className="w-5 h-5 text-rose-500" /> },
    { id: 'budgets', label: 'Monthly Budgets', icon: <PiggyBank className="w-5 h-5 text-amber-500" /> },
    { id: 'bills', label: 'Bills & Reminders', icon: <CalendarClock className="w-5 h-5 text-indigo-500" /> },
    { id: 'analytics', label: 'Analytics & Reports', icon: <PieChart className="w-5 h-5 text-sky-500" /> },
    { id: 'categories', label: 'Categories', icon: <Tags className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 h-screen sticky top-0 z-30 shrink-0">
      
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 font-heading">
            Z
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 font-heading text-base leading-tight">
              Zenith Finance
            </h1>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              SaaS Edition
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Controls */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Theme Mode Switcher */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 pl-2">
            Theme
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setTheme('light')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                theme === 'light' ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Light mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-indigo-950 text-indigo-400' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Dark mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Card with Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                {user?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'User Account'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* User Account Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-1 z-50">
              <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Switch User Session
              </div>
              {demoUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    u.id === user?.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="truncate">{u.name}</span>
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile & Settings</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
