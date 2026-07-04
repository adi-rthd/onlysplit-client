import React from 'react';

import {
  Utensils,
  Edit2,
  Trash2,
} from 'lucide-react';

import { GlassPanel } from './GlassCard';
import { getExpenseIcon } from '../../utils/expenseIcons';
import { getSplitTypeLabel } from '../../utils/splitTypeLabel';

import { formatCurrency } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const ExpenseCard = ({
  expense,
  onEdit,
  onDelete,
  onClick
}) => {
  const { currency: storeCurrency, locale } = useCurrencyStore();

  const formattedDate = new Date(
    expense.expenseDate ||
      expense.createdAt
  ).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });

  const amount = Number(
    expense.amount || 0
  );
  const Icon = getExpenseIcon(expense.title, expense.description)
  const currency = expense.currency || storeCurrency || 'INR';

  return (
    <GlassPanel onClick={onClick} className="group mb-3 flex items-center justify-between rounded-2xl border border-white/10 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.03] hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <h4 className="truncate text-sm md:text-base font-semibold text-on-surface">
            {expense.title ||
              expense.description ||
              'Untitled Expense'}
          </h4>

          <p className="mt-0.5 text-xs text-on-surface-variant truncate">
            {formattedDate}
            {' • '}
            Paid by{' '}
            <span className="font-medium text-on-surface">
              {expense.paidByName || 'Someone'}
            </span>
          </p>
        </div>
      </div>

      <div className="ml-3 flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-base md:text-lg font-bold text-on-surface tabular-nums">
            {formatCurrency(amount, currency, locale)}
          </p>

          <p className="mt-0.5 text-[10px] font-medium text-on-surface-variant">
            {getSplitTypeLabel(expense.splitType)}
          </p>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Edit2 size={14} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
};

export default ExpenseCard;