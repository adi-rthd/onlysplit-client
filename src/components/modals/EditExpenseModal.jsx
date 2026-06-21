/**
 * Edit Expense Modal — allows updating an existing expense.
 * Pre-fills all fields from the current expense data.
 * Calls PUT /api/expenses/{id} via the expense store.
 */
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useExpenseStore } from '../../store/expenseStore';
import { useGroupStore } from '../../store/groupStore';
import { useAuthStore } from '../../store/authStore';
import { getCurrencies } from '../../services/currencyService';
import { getExpenseCategory } from '../../utils/expenseIcons';
import useCurrencyStore from '../../store/useCurrencyStore';
import { useUpdateExpense } from '../../queries/mutations/useUpdateExpense';
import { featureFlags } from '../../utils/featureFlags';

const EditExpenseModal = ({ expense, groupId, onClose, onUpdated }) => {
  const { updateExpense } = useExpenseStore();
  const { currentGroup } = useGroupStore();
  const { user } = useAuthStore();
  const { currency: storeCurrency } = useCurrencyStore();

  // TanStack Query mutation (used when feature flag is enabled)
  const updateExpenseMutation = useUpdateExpense(groupId);

  const [amount, setAmount] = useState(String(expense?.amount || ''));
  const [title, setTitle] = useState(expense?.title || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [splitMethod, setSplitMethod] = useState(expense?.splitType || expense?.splits?.[0]?.splitType || 'equal');
  const [selectedMembers, setSelectedMembers] = useState(
    expense?.splits?.map((s) => s.userId) || []
  );
  const [splitValues, setSplitValues] = useState({});
  const [storeSaving, setStoreSaving] = useState(false);
  const [currencies, setCurrencies] = useState([]);

  // Determine saving state based on feature flag
  const saving = featureFlags.useQueryExpenses
    ? updateExpenseMutation.isPending
    : storeSaving;

  const members = useMemo(() => currentGroup?.members || [], [currentGroup]);

  useEffect(() => {
    getCurrencies().then((data) => { if (data) setCurrencies(data); });
  }, []);

  // Initialize split values for non-equal methods
  useEffect(() => {
    if (splitMethod !== 'equal' && expense?.splits) {
      const values = {};
      expense.splits.forEach((s) => {
        if (splitMethod === 'percentage') values[s.userId] = s.percentage || '';
        else if (splitMethod === 'shares') values[s.userId] = s.shares || '';
        else values[s.userId] = s.amountOwed || s.amount || '';
      });
      setSplitValues(values);
    }
  }, []);

  const currencySymbol = useMemo(() => {
    const active = currentGroup?.currency || storeCurrency || 'INR';
    if (active === 'INR') return '₹';
    if (active === 'USD') return '$';
    if (active === 'EUR') return '€';
    if (active === 'GBP') return '£';
    return active;
  }, [currentGroup, storeCurrency]);

  const totalPercentage = useMemo(() => {
    return selectedMembers.reduce((acc, id) => acc + Number(splitValues[id] || 0), 0);
  }, [selectedMembers, splitValues]);

  const toggleMember = (memberId) => {
    if (splitMethod === 'exact') {
      setSelectedMembers(selectedMembers.includes(memberId) ? [] : [memberId]);
      return;
    }
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const generateSplits = () => {
    const totalAmount = Number(amount);
    if (splitMethod === 'equal') {
      return selectedMembers.map((userId) => ({ userId }));
    }
    if (splitMethod === 'percentage') {
      return selectedMembers.map((userId) => ({
        userId,
        percentage: Number(splitValues[userId] || 0),
      }));
    }
    if (splitMethod === 'exact') {
      return selectedMembers.map((userId) => ({
        userId,
        amount: Number(splitValues[userId] || 0),
      }));
    }
    if (splitMethod === 'shares') {
      return selectedMembers.map((userId) => ({
        userId,
        shares: Number(splitValues[userId] || 0),
      }));
    }
    return [];
  };

  const handleSave = async () => {
    if (!amount || !title) {
      toast.error('Title and amount are required.');
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error('Select at least one member.');
      return;
    }
    if (splitMethod === 'percentage' && Math.round(totalPercentage) !== 100) {
      toast.error(`Total percentage is ${totalPercentage}%. Must equal 100%.`);
      return;
    }

    const expenseData = {
      title,
      description,
      amount: parseFloat(amount),
      category: getExpenseCategory(title),
      splitType: splitMethod,
      splits: generateSplits(),
    };

    if (featureFlags.useQueryExpenses) {
      // Use TanStack Query mutation — toasts and invalidation handled by the hook
      updateExpenseMutation.mutate(
        { expenseId: expense.id, expenseData },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      // Legacy Zustand store behavior
      setStoreSaving(true);
      try {
        await updateExpense(expense.id, expenseData);
        onUpdated?.();
        onClose();
      } catch (err) {
        // Error toast handled by service
      } finally {
        setStoreSaving(false);
      }
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ margin: 0, padding: 16, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass-card rounded-2xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <h2 className="text-lg font-bold text-on-surface">Edit Expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-5 space-y-5">
          {/* Amount */}
          <div className="rounded-xl bg-surface-container-low border border-glass-stroke p-4">
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl text-on-surface-variant font-semibold">{currencySymbol}</span>
              <input
                type="text"
                inputMode="decimal"
                className="flex-1 bg-transparent text-2xl font-bold text-on-surface outline-none border-none ring-0 focus:ring-0 placeholder:text-on-surface-variant/40"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setAmount(val);
                }}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Title
            </label>
            <input
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface outline-none ring-0 focus:ring-0 focus:border-primary/40 placeholder:text-on-surface-variant/50 text-sm transition-colors"
              placeholder="Dinner, groceries, tickets..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Description (optional)
            </label>
            <input
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface outline-none ring-0 focus:ring-0 focus:border-primary/40 placeholder:text-on-surface-variant/50 text-sm transition-colors"
              placeholder="Additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Split Method */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Split Method
            </label>
            <div className="grid grid-cols-4 gap-1 bg-surface-container-low p-1 rounded-xl border border-glass-stroke">
              {['equal', 'percentage', 'exact', 'shares'].map((method) => (
                <button
                  key={method}
                  onClick={() => setSplitMethod(method)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                    splitMethod === method
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  {method === 'percentage' ? 'Percent' : method}
                </button>
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                Split With
              </label>
              <span className="text-[11px] text-on-surface-variant">
                {selectedMembers.length} of {members.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {members.map((member) => {
                const fullName = `${member.firstName} ${member.lastName}`;
                const isSelected = selectedMembers.includes(member.userId);
                const isYou = member.userId === user?.id;

                return (
                  <div
                    key={member.userId}
                    onClick={() => toggleMember(member.userId)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-transparent bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-primary border-primary' : 'border-outline-variant'
                      }`}>
                        {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm font-medium text-on-surface">
                        {fullName}
                        {isYou && <span className="text-on-surface-variant ml-1">(You)</span>}
                      </span>
                    </div>

                    {splitMethod !== 'equal' && isSelected && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={splitValues[member.userId] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || /^\d*\.?\d*$/.test(val)) {
                              setSplitValues((prev) => ({ ...prev, [member.userId]: val }));
                            }
                          }}
                          placeholder={splitMethod === 'percentage' ? '0' : splitMethod === 'shares' ? '1' : '0'}
                          className="w-16 bg-surface-container border border-glass-stroke rounded-lg px-2 py-1 text-sm text-center outline-none text-on-surface"
                        />
                        <span className="text-xs text-on-surface-variant">
                          {splitMethod === 'percentage' ? '%' : splitMethod === 'shares' ? 'sh' : currencySymbol}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {splitMethod === 'percentage' && selectedMembers.length > 0 && (
              <div className={`mt-2 text-xs font-medium text-right ${Math.round(totalPercentage) === 100 ? 'text-neon-lime' : 'text-error'}`}>
                Total: {totalPercentage}%{Math.round(totalPercentage) !== 100 && ' (must be 100%)'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-glass-stroke flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !amount || !title}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default EditExpenseModal;
