import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { RecurrenceType, ReminderDays } from '../../types/finance';
import { Calendar, DollarSign, Bell, RefreshCw, Tag, FileText } from 'lucide-react';

export const AddBillModal: React.FC = () => {
  const { 
    isAddBillModalOpen, 
    setIsAddBillModalOpen, 
    editingBill, 
    setEditingBill, 
    categories, 
    addBill, 
    updateBill 
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('monthly');
  const [reminderDays, setReminderDays] = useState<ReminderDays>(3);
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (editingBill) {
      setName(editingBill.name);
      setAmount(editingBill.amount.toString());
      setCategoryId(editingBill.categoryId);
      setDueDate(editingBill.dueDate);
      setRecurrence(editingBill.recurrence);
      setReminderDays(editingBill.reminderDays);
      setNotes(editingBill.notes || '');
    } else {
      setName('');
      setAmount('');
      const defaultCat = expenseCategories[0]?.id || '';
      setCategoryId(defaultCat);
      setDueDate(new Date().toISOString().split('T')[0]);
      setRecurrence('monthly');
      setReminderDays(3);
      setNotes('');
    }
    setErrors({});
  }, [editingBill, isAddBillModalOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const numAmount = parseFloat(amount);
    if (!name.trim()) newErrors.name = 'Bill name is required.';
    if (isNaN(numAmount) || numAmount <= 0) newErrors.amount = 'Amount must be greater than zero.';
    if (!categoryId) newErrors.categoryId = 'Please select a category.';
    if (!dueDate) newErrors.dueDate = 'Due date is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingBill) {
      updateBill(editingBill.id, {
        name: name.trim(),
        amount: numAmount,
        categoryId,
        dueDate,
        recurrence,
        reminderDays,
        notes: notes.trim(),
        currency
      });
    } else {
      addBill({
        name: name.trim(),
        amount: numAmount,
        categoryId,
        dueDate,
        recurrence,
        reminderDays,
        notes: notes.trim(),
        currency
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setIsAddBillModalOpen(false);
    setEditingBill(null);
  };

  return (
    <Modal
      isOpen={isAddBillModalOpen}
      onClose={handleClose}
      title={editingBill ? 'Edit Bill Reminder' : 'Add Bill Reminder'}
      subtitle="Track upcoming recurring subscriptions, utility bills, and loan payments."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bill Name */}
        <Input
          label="Bill / Subscription Name"
          placeholder="e.g. Internet Bill, Netflix, Electricity, Rent"
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
          icon={<FileText className="w-4 h-4" />}
        />

        {/* Amount & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            error={errors.dueDate}
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Category & Recurrence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            error={errors.categoryId}
            icon={<Tag className="w-4 h-4" />}
            options={expenseCategories.map(c => ({ value: c.id, label: c.name }))}
          />

          <Select
            label="Recurrence Frequency"
            value={recurrence}
            onChange={e => setRecurrence(e.target.value as RecurrenceType)}
            icon={<RefreshCw className="w-4 h-4" />}
            options={[
              { value: 'one-time', label: 'One-time Bill' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>

        {/* Reminder Days & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Reminder Alert"
            value={reminderDays.toString()}
            onChange={e => setReminderDays(parseInt(e.target.value) as ReminderDays)}
            icon={<Bell className="w-4 h-4" />}
            options={[
              { value: '0', label: 'On Due Date' },
              { value: '1', label: '1 Day Before' },
              { value: '3', label: '3 Days Before' },
              { value: '7', label: '7 Days Before' },
            ]}
          />

          <Input
            label="Notes (Optional)"
            placeholder="Account #, invoice ref"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingBill ? 'Save Bill Changes' : 'Save Bill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
