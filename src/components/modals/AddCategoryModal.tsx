import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { CategoryIcon } from '../ui/CategoryIcon';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types/finance';
import { Tag, Palette } from 'lucide-react';

const AVAILABLE_ICONS = [
  'Utensils', 'Car', 'Home', 'Zap', 'ShoppingBag', 'HeartPulse', 
  'GraduationCap', 'Film', 'Plane', 'CreditCard', 'Sparkles', 'Users',
  'Briefcase', 'Laptop', 'Building2', 'TrendingUp', 'Gift', 'Coffee',
  'Smile', 'Smartphone', 'ShieldCheck', 'Music', 'Bookmark', 'HelpCircle'
];

const COLOR_PALETTE = [
  '#f59e0b', '#3b82f6', '#8b5cf6', '#f97316', '#f43f5e', '#ef4444',
  '#6366f1', '#a855f7', '#06b6d4', '#ec4899', '#10b981', '#eab308',
  '#059669', '#0284c7', '#38bdf8', '#64748b'
];

export const AddCategoryModal: React.FC = () => {
  const { isAddCategoryModalOpen, setIsAddCategoryModalOpen, addCategory } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('Tag');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    addCategory({
      name: name.trim(),
      type,
      color,
      icon
    });

    handleClose();
  };

  const handleClose = () => {
    setIsAddCategoryModalOpen(false);
    setName('');
    setType('expense');
    setColor('#3b82f6');
    setIcon('Tag');
    setError('');
  };

  return (
    <Modal
      isOpen={isAddCategoryModalOpen}
      onClose={handleClose}
      title="Create Custom Category"
      subtitle="Customize categories to personalize your spending and income tracking."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Type */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Expense Category
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Income Category
          </button>
        </div>

        {/* Name */}
        <Input
          label="Category Name"
          placeholder="e.g. Pet Care, Hobbies, Gaming"
          value={name}
          onChange={e => { setName(e.target.value); setError(''); }}
          error={error}
          icon={<Tag className="w-4 h-4" />}
        />

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Category Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PALETTE.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                  color === c ? 'ring-2 ring-indigo-600 ring-offset-2 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Icon Grid Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
            Choose Icon
          </label>
          <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            {AVAILABLE_ICONS.map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  icon === i 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <CategoryIcon name={i} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create Category
          </Button>
        </div>
      </form>
    </Modal>
  );
};
