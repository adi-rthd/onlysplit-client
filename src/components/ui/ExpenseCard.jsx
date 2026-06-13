import React from 'react';

import {
  Utensils,
  Edit2,
  Trash2,
} from 'lucide-react';

import { GlassPanel } from './GlassCard';
import { getExpenseIcon } from '../../utils/expenseIcons';

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
    <GlassPanel onClick={onClick} className="group mb-4 flex items-center justify-between rounded-3xl border border-white/10 p-5 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.03] hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          
          <Icon size={24} />
        </div>

        <div className="min-w-0">
          <h4 className="truncate text-lg font-semibold text-on-surface">
            {expense.title ||
              expense.description ||
              'Untitled Expense'}
          </h4>

          <p className="mt-1 text-sm text-on-surface-variant">
            {formattedDate}
            {' • '}
            Paid by{' '}
            <span className="font-medium text-on-surface">
              {expense.paidByName ||
                'Someone'}
            </span>
          </p>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-5">
        <div className="text-right">
          <p className="text-2xl font-bold text-on-surface">
            {formatCurrency(
              amount,
              currency,
              locale
            )}
          </p>

          <p className="mt-1 text-xs font-medium text-on-surface-variant">
            {expense.splitType?.toLowerCase() ===
            'equal'
              ? 'Equally split'
              : 'Custom split'}
          </p>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {onEdit && (
              <button
                onClick={() =>
                  onEdit(expense)
                }
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Edit2 size={15} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() =>
                  onDelete(expense.id)
                }
                className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
};

export default ExpenseCard;