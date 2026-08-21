import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CategoryIcon } from '../ui/CategoryIcon';
import { DeleteCategoryModal } from '../modals/DeleteCategoryModal';
import { Category } from '../../types/finance';
import { Plus, Tags, Trash2, Edit3, Lock } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, setIsAddCategoryModalOpen } = useFinance();

  const [activeTypeTab, setActiveTypeTab] = useState<'expense' | 'income'>('expense');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const filteredCategories = categories.filter(c => c.type === activeTypeTab);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
            Category Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Customize icons, color tags, and category taxonomies for precise auto-categorization.
          </p>
        </div>
        <Button
          onClick={() => setIsAddCategoryModalOpen(true)}
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          Add Custom Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTypeTab('expense')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTypeTab === 'expense'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Expense Categories ({categories.filter(c => c.type === 'expense').length})
        </button>
        <button
          onClick={() => setActiveTypeTab('income')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTypeTab === 'income'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Income Categories ({categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map(cat => (
          <Card key={cat.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                <CategoryIcon name={cat.icon} color={cat.color} size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {cat.name}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="w-2 h-2 rounded-full inline-block" 
                    style={{ backgroundColor: cat.color }} 
                  />
                  <span className="text-[10px] text-slate-400 font-medium capitalize">
                    {cat.isSystem ? 'System Default' : 'Custom'}
                  </span>
                </div>
              </div>
            </div>

            {!cat.isSystem ? (
              <button
                onClick={() => setCategoryToDelete(cat)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-slate-300 dark:text-slate-700 p-1.5" title="System default category">
                <Lock className="w-3.5 h-3.5" />
              </span>
            )}
          </Card>
        ))}
      </div>

      {/* Reassignment Delete Modal */}
      <DeleteCategoryModal
        categoryToDelete={categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
      />

    </div>
  );
};
