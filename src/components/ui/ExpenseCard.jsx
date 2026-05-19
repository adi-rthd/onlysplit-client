import React from 'react';
import { GlassPanel } from './GlassCard';
import { Utensils, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../services/currencyService';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  const date = new Date(expense.expenseDate || expense.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <GlassPanel className="p-4 flex items-center justify-between mb-3 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
          <Utensils size={24} />
        </div>
        <div>
          <h4 className="font-medium text-on-surface">{expense.title || expense.description}</h4>
          <p className="text-xs text-on-surface-variant">
            {date} • Paid by <span className="font-medium text-on-surface">{expense.paidByName || 'Someone'}</span>
          </p>
        </div>
      </div>

      <div className="text-right flex items-center gap-4">
        <div>
          <div className="font-medium text-on-surface">{formatCurrency(Number(expense.amount), expense.currency || 'USD')}</div>
          <div className="text-xs text-on-surface-variant">
            {expense.splitType === 'equal' ? 'Equally split' : 'Custom split'}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex flex-col gap-1">
            {onEdit && <button onClick={() => onEdit(expense)} className="text-on-surface-variant hover:text-primary"><Edit2 size={14}/></button>}
            {onDelete && <button onClick={() => onDelete(expense.id)} className="text-on-surface-variant hover:text-error"><Trash2 size={14}/></button>}
          </div>
        )}
      </div>
    </GlassPanel>
  );
};

export default ExpenseCard;
