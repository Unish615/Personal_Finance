import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { EmptyState } from '../ui/EmptyState';
import { formatMoney, formatDate } from '../../utils/formatters';
import { Transaction, PaymentMethod } from '../../types/finance';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  ArrowUpDown, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye
} from 'lucide-react';
import { Modal } from '../ui/Modal';

export const TransactionsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    deleteTransaction, 
    setEditingTransaction, 
    setIsAddTransactionModalOpen 
  } = useFinance();

  const { user } = useAuth();
  const currency = user?.currency || 'NPR';

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal details & Delete state
  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Filtered & Sorted list calculation
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

      // Payment method filter
      if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const cat = categories.find(c => c.id === tx.categoryId);
        const matchDesc = tx.description.toLowerCase().includes(q);
        const matchCat = cat?.name.toLowerCase().includes(q);
        const matchNotes = tx.notes?.toLowerCase().includes(q);
        const matchAmount = tx.amount.toString().includes(q);
        if (!matchDesc && !matchCat && !matchNotes && !matchAmount) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });
  }, [transactions, categories, typeFilter, categoryFilter, paymentFilter, searchTerm, sortField, sortOrder]);

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Payment Method', 'Account', 'Notes'];
    const rows = filteredTransactions.map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId)?.name || 'Other';
      return [
        tx.id,
        tx.date,
        tx.type,
        `"${cat}"`,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount,
        tx.currency,
        tx.paymentMethod,
        `"${tx.account || ''}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zenith_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Action & Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search description, category, amount..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              onClick={() => setIsAddTransactionModalOpen(true)}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Select
            label="Type"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'income', label: 'Income Only' },
              { value: 'expense', label: 'Expenses Only' },
            ]}
          />

          <Select
            label="Category"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
          />

          <Select
            label="Payment Method"
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment Methods' },
              { value: 'cash', label: 'Cash' },
              { value: 'bank', label: 'Bank Transfer' },
              { value: 'debit_card', label: 'Debit Card' },
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'digital_wallet', label: 'Digital Wallet' },
            ]}
          />

          <Select
            label="Sort By"
            value={`${sortField}_${sortOrder}`}
            onChange={e => {
              const [f, o] = e.target.value.split('_');
              setSortField(f as 'date' | 'amount');
              setSortOrder(o as 'asc' | 'desc');
            }}
            options={[
              { value: 'date_desc', label: 'Date (Newest First)' },
              { value: 'date_asc', label: 'Date (Oldest First)' },
              { value: 'amount_desc', label: 'Amount (Highest First)' },
              { value: 'amount_asc', label: 'Amount (Lowest First)' },
            ]}
          />
        </div>
      </Card>

      {/* Transactions Data Container */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No Transactions Found"
          description="Your financial journey starts here. Add your first income or expense to see your dashboard come alive."
          actionLabel="Add Transaction"
          onAction={() => setIsAddTransactionModalOpen(true)}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="p-4">Date</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTransactions.map(tx => {
                    const cat = categories.find(c => c.id === tx.categoryId);
                    const isIncome = tx.type === 'income';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(tx.date, 'short')}
                        </td>
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            <span className="truncate max-w-xs">{tx.description}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} size={16} />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {cat?.name || 'Category'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-slate-500 capitalize">
                          {tx.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className={`p-4 text-right font-extrabold whitespace-nowrap ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {isIncome ? '+' : '-'}{formatMoney(tx.amount, currency)}
                        </td>
                        <td className="p-4 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setViewingTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsAddTransactionModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTxId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card Stack */}
          <div className="md:hidden space-y-3">
            {filteredTransactions.map(tx => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const isIncome = tx.type === 'income';

              return (
                <Card key={tx.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {tx.description}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {formatDate(tx.date, 'short')}
                        </span>
                      </div>
                    </div>
                    <span className={`font-extrabold text-base ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {isIncome ? '+' : '-'}{formatMoney(tx.amount, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryIcon name={cat?.icon || 'Tag'} color={cat?.color} size={14} />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{cat?.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsAddTransactionModalOpen(true);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingTxId(tx.id)}
                        className="text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Transaction Details Modal */}
      {viewingTx && (
        <Modal
          isOpen={!!viewingTx}
          onClose={() => setViewingTx(null)}
          title="Transaction Details"
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">
                Amount
              </span>
              <h3 className={`text-2xl font-extrabold font-heading ${
                viewingTx.type === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'
              }`}>
                {viewingTx.type === 'income' ? '+' : '-'}{formatMoney(viewingTx.amount, currency)}
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Description</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewingTx.description}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Type</span>
                <Badge variant={viewingTx.type === 'income' ? 'success' : 'danger'}>
                  {viewingTx.type}
                </Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(viewingTx.date, 'long')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">Payment Method</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{viewingTx.paymentMethod.replace('_', ' ')}</span>
              </div>
              {viewingTx.account && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Account / Wallet</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingTx.account}</span>
                </div>
              )}
              {viewingTx.notes && (
                <div className="py-1.5">
                  <span className="text-slate-400 block mb-1">Notes</span>
                  <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {viewingTx.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="primary" onClick={() => setViewingTx(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTxId && (
        <Modal
          isOpen={!!deletingTxId}
          onClose={() => setDeletingTxId(null)}
          title="Confirm Deletion"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this transaction record? Your balance metrics will be recalculated automatically.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setDeletingTxId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteTransaction(deletingTxId);
                  setDeletingTxId(null);
                }}
              >
                Delete Transaction
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
