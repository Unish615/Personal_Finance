import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CurrencyCode, CURRENCIES } from '../../types/finance';
import { Modal } from '../ui/Modal';
import { ShieldCheck, Mail, Lock, User, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';

export const AuthScreens: React.FC = () => {
  const { login, signup, demoUsers, switchUser } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('alex@zenithfinance.io');
  const [loginPass, setLoginPass] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Signup Form
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('NPR');
  const [signupError, setSignupError] = useState('');

  // Forgot Password Modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Please enter your email.');
      return;
    }

    const success = await login(loginEmail.trim());
    if (!success) {
      setLoginError('No user found with this email. Use demo account or sign up.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    if (!name.trim()) {
      setSignupError('Name is required.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }

    await signup(name.trim(), signupEmail.trim(), currency);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setIsForgotOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden font-sans">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 font-heading">
            Z
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading">
            Zenith Finance
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent Personal Wealth Management SaaS
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-800/80 rounded-2xl">
          <button
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@zenithfinance.io"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              error={loginError}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>
          </form>
        ) : (
          /* SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Alex Morgan"
              value={name}
              onChange={e => setName(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@zenithfinance.io"
              value={signupEmail}
              onChange={e => setSignupEmail(e.target.value)}
              error={signupError}
              icon={<Mail className="w-4 h-4" />}
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

            <Button type="submit" variant="primary" className="w-full">
              Create My Isolated Account
            </Button>
          </form>
        )}

        {/* QUICK DEMO USER SWITCHER */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase text-center">
            One-Click Demo Account Access
          </span>
          <div className="space-y-1.5">
            {demoUsers.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => switchUser(u.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold">{u.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">({u.currency})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <Modal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
          title="Reset Your Password"
          maxWidth="sm"
        >
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Enter your email address and we'll send you password recovery instructions.
            </p>
            <Input
              label="Account Email"
              type="email"
              placeholder="alex@zenithfinance.io"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
            {forgotSuccess ? (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Password reset link sent to your inbox!
              </p>
            ) : null}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsForgotOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Reset Link
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
