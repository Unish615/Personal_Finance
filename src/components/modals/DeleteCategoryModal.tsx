import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types/finance';
import { AlertTriangle } from 'lucide-react';

interface DeleteCategoryModalProps {
  categoryToDelete: Category | null;
  onClose: () => void;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  categoryToDelete,
  onClose
}) => {
  const { categories, transactions, deleteCategory } = useFinance();
  const [reassignId, setReassignId] = useState<string>('');

  if (!categoryToDelete) return null;

  const affectedCount = transactions.filter(t => t.categoryId === categoryToDelete.id).length;
  const availableAlternatives = categories.filter(
    c => c.id !== categoryToDelete.id && c.type === categoryToDelete.type
  );

  const handleDelete = () => {
    if (affectedCount > 0 && !reassignId) return;

    deleteCategory(categoryToDelete.id, affectedCount > 0 ? reassignId : undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={!!categoryToDelete}
      onClose={onClose}
      title="Delete Category"
      subtitle={`Confirm deletion of ${categoryToDelete.name}`}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {affectedCount > 0 ? (
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Category in Use ({affectedCount} Transactions)</span>
            </div>
            <p className="text-amber-700 dark:text-amber-400">
              This category cannot be deleted directly because {affectedCount} existing transactions rely on it. Please choose a replacement category to reassign those transactions.
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <strong>{categoryToDelete.name}</strong>? This action cannot be undone.
          </p>
        )}

        {affectedCount > 0 && (
          <Select
            label="Reassign Existing Transactions To"
            value={reassignId}
            onChange={e => setReassignId(e.target.value)}
            options={[
              { value: '', label: '-- Select Replacement Category --' },
              ...availableAlternatives.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={affectedCount > 0 && !reassignId}
          >
            {affectedCount > 0 ? 'Reassign & Delete' : 'Delete Category'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
