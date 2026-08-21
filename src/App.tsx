import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { AuthScreens } from './components/auth/AuthScreens';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';

// Feature Views
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { IncomeView } from './components/views/IncomeView';
import { ExpensesView } from './components/views/ExpensesView';
import { BudgetsView } from './components/views/BudgetsView';
import { BillsView } from './components/views/BillsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { CategoriesView } from './components/views/CategoriesView';
import { SettingsView } from './components/views/SettingsView';
import { ProfileView } from './components/views/ProfileView';

// Global Modals
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { AddBillModal } from './components/modals/AddBillModal';
import { AddBudgetModal } from './components/modals/AddBudgetModal';
import { AddCategoryModal } from './components/modals/AddCategoryModal';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { activeTab } = useFinance();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center text-white font-bold text-xl font-heading">
            Z
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase">Loading Zenith Finance...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreens />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* First Time Onboarding Flow */}
      {user && !user.onboarded && <OnboardingWizard />}

      {/* Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main SaaS Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'income' && <IncomeView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'budgets' && <BudgetsView />}
          {activeTab === 'bills' && <BillsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>

        {/* Mobile Navigation Bar */}
        <MobileNav />
      </div>

      {/* Reusable Modals */}
      <AddTransactionModal />
      <AddBillModal />
      <AddBudgetModal />
      <AddCategoryModal />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <MainAppContent />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
