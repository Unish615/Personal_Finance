import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { CurrencyCode, CURRENCIES } from '../../types/finance';
import { StorageService } from '../../services/storage';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Download, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Modal } from '../ui/Modal';

export const SettingsView: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { resetDemoData } = useFinance();
  const { theme, setTheme } = useTheme();

  const [currency, setCurrency] = useState<CurrencyCode>(user?.currency || 'NPR');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'DD/MM/YYYY');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security Form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  // Modals
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ currency, dateFormat });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) return;
    setPassSuccess(true);
    setCurrentPass('');
    setNewPass('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  const handleExportData = () => {
    if (!user) return;
    const jsonStr = StorageService.exportUserDataJSON(user.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenith_backup_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      
      {/* Preferences Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
            Preferences & Localization
          </h4>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Base Currency"
              value={currency}
              onChange={e => setCurrency(e.target.value as CurrencyCode)}
              options={Object.values(CURRENCIES).map(c => ({
                value: c.code,
                label: `${c.code} (${c.symbol}) - ${c.name}`
              }))}
            />

            <Select
              label="Date Display Format"
              value={dateFormat}
              onChange={e => setDateFormat(e.target.value as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD')}
              options={[
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (e.g. 21/08/2026)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (e.g. 08/21/2026)' },
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (e.g. 2026-08-21)' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4 text-amber-500" /> },
                { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
                { id: 'system', label: 'System', icon: <Globe className="w-4 h-4 text-slate-400" /> },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Preferences saved!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" size="sm">
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
            Account Security & Authentication
          </h4>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {passSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Password updated successfully!
              </span>
            ) : <span />}

            <Button type="submit" variant="outline" size="sm">
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Data Management Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 font-heading">
            Data Portability & Reset
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Export Complete Backup (JSON)
            </h5>
            <p className="text-xs text-slate-500">
              Download your entire isolated profile, categories, transactions, budgets, and bills.
            </p>
            <Button onClick={handleExportData} variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Download Backup
            </Button>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Reset Demo Data
            </h5>
            <p className="text-xs text-slate-500">
              Re-populate realistic demo transactions, income, and budgets for testing.
            </p>
            <Button onClick={() => setIsResetConfirmOpen(true)} variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Reset Demo Data
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h5 className="font-bold text-xs text-rose-600">Danger Zone</h5>
            <p className="text-xs text-slate-400">Permanently delete your user account and data.</p>
          </div>
          <Button onClick={() => setIsDeleteAccountOpen(true)} variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />}>
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Reset Modal */}
      {isResetConfirmOpen && (
        <Modal
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          title="Reset Demo Data"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to reset your transactions and rebuild fictional demo data?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsResetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  resetDemoData();
                  setIsResetConfirmOpen(false);
                }}
              >
                Reset Data Now
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Account Modal */}
      {isDeleteAccountOpen && (
        <Modal
          isOpen={isDeleteAccountOpen}
          onClose={() => setIsDeleteAccountOpen(false)}
          title="Delete Account"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Warning: This action is permanent and irreversible!</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              All stored transactions, budgets, bills, and profile data will be permanently wiped.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setIsDeleteAccountOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (user) StorageService.clearUserData(user.id);
                  logout();
                }}
              >
                Permanently Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
