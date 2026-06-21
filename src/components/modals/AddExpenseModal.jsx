import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  X,
  Users,
  ChevronsUpDown,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';
import { getCurrencies } from '../../services/currencyService';
import { getExpenseCategory } from '../../utils/expenseIcons';
import { useAuthStore } from '../../store/authStore';
import useCurrencyStore from '../../store/useCurrencyStore';
import { useCreateExpense } from '../../queries/mutations/useCreateExpense';
import { featureFlags } from '../../utils/featureFlags';

const AddExpenseModal = () => {
  const navigate = useNavigate();
  const { id: rawGroupId } = useParams();
  const groupId = rawGroupId && rawGroupId !== 'all' ? rawGroupId : '';
  const { user } = useAuthStore();
  const { currency: storeCurrency } = useCurrencyStore();
  const { groups, fetchGroups } = useGroupStore();
  const { createExpense, isLoading: storeIsSubmitting } = useExpenseStore();
  const backdropRef = useRef(null);
  const amountRef = useRef(null);

  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitValues, setSplitValues] = useState({});

  // TanStack Query mutation (used when feature flag is enabled)
  const createExpenseMutation = useCreateExpense(selectedGroupId);

  // Determine loading state based on feature flag
  const isSubmitting = featureFlags.useQueryExpenses
    ? createExpenseMutation.isPending
    : storeIsSubmitting;

  const isGroupContext = Boolean(groupId);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') navigate(-1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Auto-focus amount input on mount
  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
  }, []);

  useEffect(() => { fetchGroups(); }, []);

  useEffect(() => {
    const loadCurrencies = async () => {
      const data = await getCurrencies();
      setCurrencies(data || []);
    };
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups]);

  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId);
  }, [groups, selectedGroupId]);

  const members = useMemo(() => {
    if (!selectedGroup?.members) return [];
    return selectedGroup.members;
  }, [selectedGroup, user]);

  useEffect(() => {
    setSplitValues({});
    if (members.length > 0) {
      setSelectedMembers(members.map((m) => m.userId));
    } else {
      setSelectedMembers([]);
    }
  }, [selectedGroupId, members.length]);

  const currencySymbol = useMemo(() => {
    const activeCurrency = selectedGroup?.currency || storeCurrency || 'INR';
    if (activeCurrency === 'INR') return '₹';
    if (activeCurrency === 'USD') return '$';
    if (activeCurrency === 'EUR') return '€';
    if (activeCurrency === 'GBP') return '£';
    const currencyItem = currencies.find((c) => (c.iso_code || c.code) === activeCurrency);
    return currencyItem?.symbol || activeCurrency;
  }, [currencies, selectedGroup, storeCurrency]);

  const totalPercentage = useMemo(() => {
    return selectedMembers.reduce((acc, memberId) => acc + Number(splitValues[memberId] || 0), 0);
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

  const handleSplitValueChange = (memberId, value) => {
    setSplitValues((prev) => ({ ...prev, [memberId]: value }));
  };

  const generateSplits = () => {
    const totalAmount = Number(amount);
    if (splitMethod === 'equal') {
      const perPerson = totalAmount / selectedMembers.length;
      return selectedMembers.map((memberId) => ({ userId: memberId, amount: Number(perPerson.toFixed(2)) }));
    }
    if (splitMethod === 'percentage') {
      return selectedMembers.map((memberId) => {
        const percent = Number(splitValues[memberId] || 0);
        return { userId: memberId, percentage: percent, amount: Number(((totalAmount * percent) / 100).toFixed(2)) };
      });
    }
    if (splitMethod === 'exact') {
      return selectedMembers.map((memberId) => ({ userId: memberId, amount: Number(splitValues[memberId] || 0) }));
    }
    if (splitMethod === 'shares') {
      const totalShares = selectedMembers.reduce((acc, id) => acc + Number(splitValues[id] || 0), 0);
      return selectedMembers.map((memberId) => {
        const shares = Number(splitValues[memberId] || 0);
        return { userId: memberId, shares, amount: Number(((totalAmount * shares) / totalShares).toFixed(2)) };
      });
    }
    return [];
  };

  const handleSubmit = async () => {
    if (!amount || !title || !selectedGroupId) {
      toast.error('Please fill in all fields');
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error('Select at least one member.');
      return;
    }
    if (splitMethod === 'percentage' && Math.round(totalPercentage) !== 100) {
      toast.error(`Total percentage is ${totalPercentage}%. It must equal 100%.`);
      return;
    }

    const expenseData = {
      groupId: selectedGroupId,
      title: title,
      description: description,
      amount: parseFloat(amount),
      category: getExpenseCategory(title),
      splitType: splitMethod,
      splits: generateSplits(),
    };

    if (featureFlags.useQueryExpenses) {
      // Use TanStack Query mutation — toasts handled by the hook
      createExpenseMutation.mutate(expenseData, {
        onSuccess: () => {
          navigate(-1);
        },
      });
    } else {
      // Legacy Zustand store behavior
      try {
        await createExpense(expenseData);
        navigate(-1);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const perPersonAmount = useMemo(() => {
    if (!amount || selectedMembers.length === 0) return '';
    if (splitMethod !== 'equal') return '';
    return (Number(amount) / selectedMembers.length).toFixed(2);
  }, [amount, selectedMembers.length, splitMethod]);

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      style={{ margin: 0, padding: 16, left: 0, right: 0, top: 0, bottom: 0 }}
      onClick={(e) => e.target === backdropRef.current && navigate(-1)}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass-card rounded-2xl shadow-2xl flex flex-col max-h-[80vh] md:max-h-[85vh]"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <h2 className="text-lg font-bold text-on-surface">Add Expense</h2>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 hide-scrollbar px-5 pb-5 space-y-5">

          {/* AMOUNT INPUT */}
          <div className="rounded-xl bg-surface-container-low border border-glass-stroke p-4">
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl text-on-surface-variant font-semibold">{currencySymbol}</span>
              <input
                ref={amountRef}
                type="text"
                inputMode="decimal"
                className="flex-1 bg-transparent text-2xl font-bold text-on-surface outline-none border-none ring-0 focus:ring-0 focus:border-none placeholder:text-on-surface-variant/40"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) {
                    setAmount(val);
                  }
                }}
              />
            </div>
            {perPersonAmount && (
              <p className="text-xs text-on-surface-variant mt-2">
                {currencySymbol}{perPersonAmount} per person × {selectedMembers.length}
              </p>
            )}
          </div>

          {/* TITLE */}
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

          {/* DESCRIPTION */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Description (optional)
            </label>
            <input
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface outline-none ring-0 focus:ring-0 focus:border-primary/40 placeholder:text-on-surface-variant/50 text-sm transition-colors"
              placeholder="Additional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* GROUP SELECTOR */}
          {!isGroupContext && (
            <div>
              <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
                Group
              </label>
              <div className="relative">
                <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <select
                  className="w-full bg-surface-container-low border border-glass-stroke rounded-xl pl-10 pr-10 py-3 text-on-surface outline-none appearance-none cursor-pointer text-sm"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id} className="bg-surface-charcoal text-on-surface">
                      {g.name}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
          )}

          {/* SPLIT METHOD */}
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

          {/* SPLIT WITH */}
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
                              handleSplitValueChange(member.userId, val);
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

        {/* FOOTER */}
        <div className="px-5 py-4 border-t border-glass-stroke flex gap-3 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || !title}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Split Expense'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default AddExpenseModal;
