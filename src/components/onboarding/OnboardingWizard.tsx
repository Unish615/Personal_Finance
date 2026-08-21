import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CurrencyCode, CURRENCIES } from '../../types/finance';
import { Wallet, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { user, updateProfile, completeOnboarding } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(user?.name || '');
  const [currency, setCurrency] = useState<CurrencyCode>(user?.currency || 'NPR');
  const [incomeGoal, setIncomeGoal] = useState<string>('75000');

  const handleNextStep = () => {
    if (step === 1) {
      updateProfile({ name: name.trim() || 'Finance User', currency });
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    const numGoal = parseFloat(incomeGoal) || 75000;
    completeOnboarding(numGoal);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas-confetti fails in restricted environments
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              Z
            </div>
            <span className="font-heading font-bold text-slate-900 dark:text-slate-100">Zenith Finance</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-indigo-600' : s < step ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Profile & Currency */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                Welcome to Zenith Finance 👋
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Let's set up your personalized financial dashboard in just a few seconds.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Your Preferred Name"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <Select
                label="Primary Base Currency"
                value={currency}
                onChange={e => setCurrency(e.target.value as CurrencyCode)}
                options={Object.values(CURRENCIES).map(c => ({
                  value: c.code,
                  label: `${c.code} (${c.symbol}) - ${c.name}`
                }))}
              />
            </div>
          </div>
        )}

        {/* STEP 2: Monthly Income Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                Monthly Income Baseline 💰
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set an estimated monthly income baseline to help compute savings trends and budget limits.
              </p>
            </div>

            <Input
              label={`Estimated Monthly Income (${currency})`}
              type="number"
              placeholder="e.g. 75000"
              value={incomeGoal}
              onChange={e => setIncomeGoal(e.target.value)}
              icon={<Wallet className="w-4 h-4" />}
            />
          </div>
        )}

        {/* STEP 3: Setup Ready */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200 py-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                You're All Set! 🚀
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Your personalized categories, budget meters, and smart auto-categorization engine are ready.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-xs text-left space-y-2 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Isolated Security & Instant Offline Sync</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                Your financial records are strictly isolated to your account. No external server tracking.
              </p>
            </div>
          </div>
        )}

        {/* Buttons Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <button
              onClick={finishOnboarding}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              Skip onboarding
            </button>
          )}

          <Button
            onClick={handleNextStep}
            variant="primary"
            icon={step === 3 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          >
            {step === 3 ? 'Launch Dashboard' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
