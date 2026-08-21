import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Tag, DollarSign, Calendar } from 'lucide-react';

export const AddBudgetModal: React.FC = () => {
  const { 
    isAddBudgetModalOpen, 
    setIsAddBudgetModalOpen, 
    editingBudget, 
    setEditingBudget, 
    categories, 
    addBudget, 
    updateBudget 
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setAmount(editingBudget.amount.toString());
      setMonth(editingBudget.month);
      setYear(editingBudget.year);
    } else {
      setCategoryId(expenseCategories[0]?.id || '');
      setAmount('');
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    }
    setErrors({});
  }, [editingBudget, isAddBudgetModalOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!categoryId) newErrors.categoryId = 'Please select a category.';
    if (isNaN(numAmount) || numAmount <= 0) newErrors.amount = 'Budget amount must be positive.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId,
        amount: numAmount,
        month,
        year
      });
    } else {
      addBudget({
        categoryId,
        amount: numAmount,
        month,
        year
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAddBudgetModalOpen(false);
    setEditingBudget(null);
  };

  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <Modal
      isOpen={isAddBudgetModalOpen}
      onClose={handleClose}
      title={editingBudget ? 'Edit Monthly Budget' : 'Set Category Budget'}
      subtitle="Allocate spending limits for your expense categories."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <Select
          label="Category"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          error={errors.categoryId}
          icon={<Tag className="w-4 h-4" />}
          options={expenseCategories.map(c => ({ value: c.id, label: c.name }))}
        />

        {/* Budget Limit Amount */}
        <Input
          label={`Monthly Budget Limit (${currency})`}
          type="number"
          step="any"
          placeholder="e.g. 15000"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          error={errors.amount}
          icon={<DollarSign className="w-4 h-4" />}
        />

        {/* Month & Year Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Month"
            value={month.toString()}
            onChange={e => setMonth(parseInt(e.target.value))}
            icon={<Calendar className="w-4 h-4" />}
            options={monthOptions}
          />
          <Input
            label="Year"
            type="number"
            value={year.toString()}
            onChange={e => setYear(parseInt(e.target.value))}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingBudget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
