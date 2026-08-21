import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatDate } from '../../utils/formatters';
import { Bell, CheckCheck, Trash2, X, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { ActiveTab } from '../../types/finance';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications, setActiveTab } = useFinance();

  if (!isOpen) return null;

  const handleItemClick = (id: string, link?: string) => {
    markNotificationRead(id);
    if (link) {
      setActiveTab(link as ActiveTab);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bill_overdue':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'bill_due':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'budget_exceeded':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'budget_warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 font-heading">
                Notifications
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="p-1.5 text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  title="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                  You have no pending bill alerts or budget warnings.
                </p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n.id, n.link)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    n.read 
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75' 
                      : 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDate(n.createdAt.split('T')[0], 'short')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
