import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { PaymentMethod, TransactionType, Transaction } from '../../types/finance';
import { suggestCategory } from '../../services/smartCategory';
import { Sparkles, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';

export const AddTransactionModal: React.FC = () => {
  const { 
    isAddTransactionModalOpen, 
    setIsAddTransactionModalOpen, 
    editingTransaction, 
    setEditingTransaction,
    categories, 
    addTransaction, 
    updateTransaction 
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit_card');
  const [account, setAccount] = useState<string>('Main Account');
  const [notes, setNotes] = useState<string>('');
  
  const [suggestedCat, setSuggestedCat] = useState<{ id: string; name: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate fields when modal opens/edits
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setAccount(editingTransaction.account || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('debit_card');
      setAccount('Main Account');
      setNotes('');
      // Default to first available expense category
      const firstExp = categories.find(c => c.type === 'expense');
      if (firstExp) setCategoryId(firstExp.id);
    }
    setErrors({});
    setSuggestedCat(null);
  }, [editingTransaction, isAddTransactionModalOpen, categories]);

  // Smart Auto-Categorization on description change (Requirement #9)
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setDescription(text);

    if (type === 'expense' && !editingTransaction) {
      const suggestion = suggestCategory(text, categories);
      if (suggestion) {
        setSuggestedCat({ id: suggestion.categoryId, name: suggestion.categoryName });
      } else {
        setSuggestedCat(null);
      }
    }
  };

  const applySuggestion = () => {
    if (suggestedCat) {
      setCategoryId(suggestedCat.id);
      setSuggestedCat(null);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than zero.';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required.';
    }
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category.';
    }
    if (!date) {
      newErrors.date = 'Please choose a valid date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        amount: numAmount,
        categoryId,
        description: description.trim(),
        date,
        paymentMethod,
        account: account.trim(),
        notes: notes.trim(),
        currency
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        categoryId,
        description: description.trim(),
        date,
        paymentMethod,
        account: account.trim(),
        notes: notes.trim(),
        currency
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAddTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'digital_wallet', label: 'Digital Wallet (eSewa / Khalti / PayPal)' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isAddTransactionModalOpen}
      onClose={handleClose}
      title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      subtitle="Record an income or expense transaction to keep your balance up to date."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              const firstExp = categories.find(c => c.type === 'expense');
              if (firstExp) setCategoryId(firstExp.id);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              const firstInc = categories.find(c => c.type === 'income');
              if (firstInc) setCategoryId(firstInc.id);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label={`Amount (${currency})`}
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              error={errors.amount}
              icon={<DollarSign className="w-4 h-4" />}
            />
          </div>
          <div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              error={errors.date}
            />
          </div>
        </div>

        {/* Description & Smart Suggestion Tag */}
        <div>
          <Input
            label="Description"
            placeholder={type === 'expense' ? 'e.g. McDonald dinner, Uber ride' : 'e.g. Monthly salary, Freelance project'}
            value={description}
            onChange={handleDescriptionChange}
            error={errors.description}
            icon={<FileText className="w-4 h-4" />}
          />
          {suggestedCat && (
            <div className="mt-2 flex items-center justify-between p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 rounded-xl text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>Suggested Category: <strong>{suggestedCat.name}</strong></span>
              </div>
              <button
                type="button"
                onClick={applySuggestion}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            error={errors.categoryId}
            icon={<Tag className="w-4 h-4" />}
            options={filteredCategories.map(c => ({
              value: c.id,
              label: c.name
            }))}
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
            icon={<CreditCard className="w-4 h-4" />}
            options={paymentOptions}
          />
        </div>

        {/* Account & Optional Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Account / Wallet (Optional)"
            placeholder="e.g. Chase Bank, Wallet"
            value={account}
            onChange={e => setAccount(e.target.value)}
          />
          <Input
            label="Notes (Optional)"
            placeholder="Additional transaction info"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant={type === 'income' ? 'success' : 'primary'}>
            {editingTransaction ? 'Save Changes' : type === 'income' ? 'Add Income' : 'Add Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
