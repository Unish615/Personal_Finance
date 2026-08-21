import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { CurrencyCode, CURRENCIES } from '../../types/finance';
import { User, Mail, DollarSign, CheckCircle2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState<CurrencyCode>(user?.currency || 'NPR');
  const [incomeGoal, setIncomeGoal] = useState((user?.monthlyIncomeGoal || 75000).toString());
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      currency,
      monthlyIncomeGoal: parseFloat(incomeGoal) || 75000
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center font-heading shadow-md shadow-indigo-500/20">
            {user?.name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
              {user?.name}
            </h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold text-[10px]">
              Active SaaS Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Default Base Currency"
              value={currency}
              onChange={e => setCurrency(e.target.value as CurrencyCode)}
              options={Object.values(CURRENCIES).map(c => ({
                value: c.code,
                label: `${c.code} (${c.symbol}) - ${c.name}`
              }))}
            />

            <Input
              label={`Monthly Income Baseline (${currency})`}
              type="number"
              value={incomeGoal}
              onChange={e => setIncomeGoal(e.target.value)}
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary">
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

    </div>
  );
};
