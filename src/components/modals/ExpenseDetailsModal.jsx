import { X, Receipt, Users, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenseIcon } from '../../utils/expenseIcons';
import { useExpenseStore } from '../../store/expenseStore';
import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';

const ExpenseDetailsModal = ({
    expense,
    onClose,
    onEdit,
}) => {
    const { deleteExpense } = useExpenseStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Escape key
    useEffect(() => {
      const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!expense) return null;

    const handleDelete = async () => {

        try {
            await deleteExpense(expense.id);
            onClose();
        } catch {
            // Error toast handled by expenseService
        }
    };
    const splitCount = expense.splits?.length || 0;
    const Icon = getExpenseIcon(expense.title, expense.description)

    return (
        <AnimatePresence>

            <motion.div
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <ConfirmModal
                    open={showDeleteModal}
                    title="Delete Expense"
                    message={`Are you sure you want to delete "${expense.title}"?`}
                    confirmText="Delete"
                    danger
                    onCancel={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                />
                <motion.div
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-2xl rounded-2xl glass-card shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[85vh] overflow-y-auto"
                >

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-glass-stroke backdrop-blur-xl bg-white/[0.03]">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Icon
                                    size={20}
                                    className="text-primary"
                                />
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold text-white">
                                    {expense.title}
                                </h3>


                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(expense)}
                                className="w-9 h-9 rounded-xl hover:bg-blue-500/10 text-blue-400 flex items-center justify-center transition-colors"
                              >
                                <Pencil size={16} />
                              </button>
                            )}

                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-9 h-9 rounded-xl hover:bg-red-500/10 text-red-400 flex items-center justify-center transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>

                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Expense Header */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-6">

                            {/* <div>
                <h3 className="text-3xl font-bold text-white">
                  {expense.title}
                </h3>

                <p className="text-emerald-400 text-3xl font-bold mt-2">
                  ₹
                  {Number(
                    expense.amount || 0
                  ).toLocaleString()}
                </p>
              </div> */}
                            <div className="flex items-center gap-2 mt-2 text-sm">

                                <span className="text-on-surface-variant">
                                    Paid by
                                </span>

                                <span className="font-semibold text-white">
                                    {expense.paidByName}
                                </span>

                                <span className="text-on-surface-variant">
                                    •
                                </span>

                                <span className="text-primary capitalize">
                                    {expense.splits?.[0]?.splitType || 'Equal'} Split
                                </span>
                            </div>

                            <div className="text-left md:text-right">


                                <span className="inline-flex mt-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs capitalize">
                                    {expense.category}
                                </span>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard
                                        size={14}
                                        className="text-emerald-400"
                                    />
                                    <span className="text-xs text-on-surface-variant uppercase">
                                        Amount
                                    </span>
                                </div>

                                <p className="font-bold text-lg">
                                    ₹
                                    {Number(
                                        expense.amount || 0
                                    ).toLocaleString()}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users
                                        size={14}
                                        className="text-primary"
                                    />
                                    <span className="text-xs text-on-surface-variant uppercase">
                                        Members
                                    </span>
                                </div>

                                <p className="font-bold text-lg">
                                    {splitCount}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Receipt
                                        size={14}
                                        className="text-yellow-400"
                                    />
                                    <span className="text-xs text-on-surface-variant uppercase">
                                        Per Person
                                    </span>
                                </div>

                                <p className="font-bold text-lg">
                                    ₹
                                    {Number(
                                        expense.splits?.[0]
                                            ?.amountOwed || 0
                                    ).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        {/* Split Breakdown */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Users
                                    size={18}
                                    className="text-primary"
                                />

                                <h4 className="text-lg font-semibold">
                                    Split Breakdown
                                </h4>
                            </div>

                            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                {expense.splits?.map(
                                    (split) => {
                                        const isPayer =
                                            split.userId ===
                                            expense.paidBy;

                                        return (
                                            <div
                                                key={split.id}
                                                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors"
                                            >
                                                <div>
                                                    <p className="font-medium text-white">
                                                        {
                                                            split.firstName
                                                        }{' '}
                                                        {
                                                            split.lastName
                                                        }
                                                    </p>

                                                    <p className="text-xs text-on-surface-variant mt-0.5">
                                                        {isPayer
                                                            ? 'Paid this expense'
                                                            : `Owes ${expense.paidByName}`}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-white">
                                                        ₹
                                                        {Number(
                                                            split.amountOwed
                                                        ).toLocaleString()}
                                                    </p>

                                                    {isPayer && (
                                                        <span className="text-[11px] text-emerald-400">
                                                            Payer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ExpenseDetailsModal;
