import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { motion } from 'framer-motion';

import {
  X,
  Edit3,
  Plane,
  ChevronsUpDown,
  Loader2,
  Check,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';

import { getCurrencies } from '../../services/currencyService';

import { useAuthStore } from '../../store/authStore';
import useCurrencyStore from '../../store/useCurrencyStore';
const AddExpenseModal = () => {
  const navigate = useNavigate();

  const { groupId } = useParams();
  const { user } = useAuthStore();
  const { currency: storeCurrency } = useCurrencyStore();

  const {
    groups,
    fetchGroups,
  } = useGroupStore();

  

  const {
    createExpense,
    isLoading: isSubmitting,
  } = useExpenseStore();

  const [currencies, setCurrencies] =
    useState([]);

  const [amount, setAmount] =
    useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    selectedGroupId,
    setSelectedGroupId,
  ] = useState(groupId || '');

  const [splitMethod, setSplitMethod] =
    useState('equal');

  const [
    selectedMembers,
    setSelectedMembers,
  ] = useState([]);

  const [splitValues, setSplitValues] =
    useState({});

  const isGroupContext =
    Boolean(groupId);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const loadCurrencies =
      async () => {
        const data =
          await getCurrencies();

        setCurrencies(
          data || []
        );
      };

    loadCurrencies();
  }, []);

  useEffect(() => {
    if (
      groups.length > 0 &&
      !selectedGroupId
    ) {
      setSelectedGroupId(
        groups[0].id
      );
    }
  }, [groups]);

  const selectedGroup =
    useMemo(() => {
      return groups.find(
        (g) =>
          g.id ===
          selectedGroupId
      );
    }, [
      groups,
      selectedGroupId,
    ]);

  const members =
    useMemo(() => {
      if (
        !selectedGroup?.members
      ) {
        return [];
      }

      return selectedGroup.members.filter(
        (member) =>
          member.userId !==
          user?.id
      );
    }, [
      selectedGroup,
      user,
    ]);

  useEffect(() => {
    setSelectedMembers([]);
    setSplitValues({});

    if (members.length > 0) {
      setSelectedMembers(
        members.map(
          (member) => member.userId
        )
      );
    }
  }, [selectedGroupId]);
  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    const filteredMembers =
      selectedGroup.members.filter(
        (member) =>
          member.userId !== user?.id
      );

    setSelectedMembers(
      filteredMembers.map(
        (member) => member.userId
      )
    );
  }, [selectedGroupId]);
  const currencySymbol =
    useMemo(() => {
      const activeCurrency = selectedGroup?.currency || storeCurrency || 'INR';
      if (
        activeCurrency ===
        'INR'
      ) {
        return '₹';
      }

      const currencyItem =
        currencies.find(
          (c) =>
            (c.iso_code || c.code) ===
            activeCurrency
        );

      return (
        currencyItem?.symbol ||
        (activeCurrency === 'USD' ? '$' : activeCurrency)
      );
    }, [
      currencies,
      selectedGroup,
      storeCurrency,
    ]);

  const toggleMember = (
    memberId
  ) => {
    if (
      splitMethod ===
      'exact' &&
      selectedMembers.includes(
        memberId
      )
    ) {
      setSelectedMembers(
        []
      );

      return;
    }

    if (
      splitMethod ===
      'exact'
    ) {
      setSelectedMembers([
        memberId,
      ]);

      return;
    }

    setSelectedMembers(
      (prev) => {
        if (
          prev.includes(
            memberId
          )
        ) {
          return prev.filter(
            (id) =>
              id !== memberId
          );
        }

        return [
          ...prev,
          memberId,
        ];
      }
    );
  };

  const handleSplitValueChange =
    (
      memberId,
      value
    ) => {
      setSplitValues(
        (prev) => ({
          ...prev,
          [memberId]:
            value,
        })
      );
    };

  const generateSplits =
    () => {
      const totalAmount =
        Number(amount);

      if (
        splitMethod ===
        'equal'
      ) {
        const perPerson =
          totalAmount /
          selectedMembers.length;

        return selectedMembers.map(
          (memberId) => ({
            userId:
              memberId,

            amount:
              Number(
                perPerson.toFixed(
                  2
                )
              ),
          })
        );
      }

      if (
        splitMethod ===
        'percentage'
      ) {
        return selectedMembers.map(
          (memberId) => {
            const percent =
              Number(
                splitValues[
                memberId
                ] || 0
              );

            return {
              userId:
                memberId,

              amount:
                Number(
                  (
                    (totalAmount *
                      percent) /
                    100
                  ).toFixed(
                    2
                  )
                ),
            };
          }
        );
      }

      if (
        splitMethod ===
        'exact'
      ) {
        return selectedMembers.map(
          (memberId) => ({
            userId:
              memberId,

            amount:
              totalAmount,
          })
        );
      }

      if (
        splitMethod ===
        'shares'
      ) {
        const totalShares =
          selectedMembers.reduce(
            (
              acc,
              memberId
            ) =>
              acc +
              Number(
                splitValues[
                memberId
                ] || 0
              ),
            0
          );

        return selectedMembers.map(
          (memberId) => {
            const shares =
              Number(
                splitValues[
                memberId
                ] || 0
              );

            return {
              userId:
                memberId,

              amount:
                Number(
                  (
                    (totalAmount *
                      shares) /
                    totalShares
                  ).toFixed(
                    2
                  )
                ),
            };
          }
        );
      }

      return [];
    };

  const handleSubmit =
    async () => {
      if (
        !amount ||
        !description ||
        !selectedGroupId
      ) {
        toast.error(
          'Please fill in all fields'
        );

        return;
      }

      if (
        selectedMembers.length ===
        0
      ) {
        toast.error(
          'Select at least one member.'
        );

        return;
      }

      if (
        splitMethod ===
        'percentage'
      ) {
        const totalPercent =
          selectedMembers.reduce(
            (
              acc,
              memberId
            ) =>
              acc +
              Number(
                splitValues[
                memberId
                ] || 0
              ),
            0
          );

        if (
          totalPercent !==
          100
        ) {
          toast.error(
            'Total percentage must equal 100%'
          );

          return;
        }
      }

      try {
        const payload = {
          groupId: selectedGroupId,
          title: description,
          description: '',
          amount: parseFloat(amount),
          category: 'General',
          splitType: splitMethod,
          splits: splitMethod === 'equal' ? [] : generateSplits(),
        };

        await createExpense(
          payload
        );
        navigate(-1);
      } catch (error) {
        console.error(
          error
        );
      }
    };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        className="w-full max-w-lg bg-surface-charcoal/90 backdrop-blur-2xl border border-glass-stroke rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-glass-stroke bg-white/5">
          <h2 className="text-xl font-bold">
            Add Expense
          </h2>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] hide-scrollbar">
          {/* AMOUNT */}
          <div className="flex flex-col items-center py-1">
            <label className="text-[12px] font-label-caps text-primary tracking-widest mb-2">
              AMOUNT
            </label>

            <div className="flex items-center text-4xl font-bold">
              <span className="opacity-50 mr-2">
                {
                  currencySymbol
                }
              </span>

              <input
                type="number"
                className="bg-transparent border-none p-0 w-24 text-center focus:ring-0 outline-none"
                placeholder="0.00"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
              Description
            </label>

            <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3">
              <Edit3 className="text-outline mr-3" size={20} />

              <input
                className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none text-on-surface"
                placeholder="What was this for?"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* GROUP */}
          {!isGroupContext && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Group
              </label>

              <div className="flex items-center justify-between bg-surface-container-low border border-glass-stroke rounded-lg p-3">
                <div className="flex items-center gap-3 w-full">
                  <Plane className="text-secondary" size={20} />

                  <select
                    className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none cursor-pointer appearance-none"
                    value={selectedGroupId}
                    onChange={(e) =>
                      setSelectedGroupId(
                        e.target.value
                      )
                    }
                  >
                    {groups.map(
                      (g) => (
                        <option
                          key={g.id}
                          value={g.id}
                          className="bg-surface-charcoal text-on-surface"
                        >
                          {g.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <ChevronsUpDown size={20} className="text-outline pointer-events-none" />
              </div>
            </div>
          )}

          {/* SPLIT METHOD */}
          <div className="space-y-3">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
              Split Method
            </label>

            <div className="flex bg-surface-container-low p-1 rounded-xl border border-glass-stroke">
              {[
                'equal',
                'percentage',
                'exact',
                'shares',
              ].map((method) => (
                <button
                  key={method}
                  onClick={() =>
                    setSplitMethod(
                      method
                    )
                  }
                  className={`flex-1 py-2 rounded-lg font-medium text-xs transition-colors capitalize ${splitMethod ===
                    method
                    ? 'bg-primary-container text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  {method ===
                    'percentage'
                    ? 'Percent'
                    : method}
                </button>
              ))}
            </div>
          </div>

          {/* SPLIT WITH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">
                Split With
              </label>

              <span className="text-xs text-on-surface-variant">
                {
                  selectedMembers.length
                }{' '}
                selected
              </span>
            </div>

            <div className="space-y-2">
              {members.map(
                (
                  member
                ) => {
                  const fullName = `${member.firstName} ${member.lastName}`;

                  const isSelected =
                    selectedMembers.includes(
                      member.userId
                    );

                  return (
                    <div
                      key={
                        member.userId
                      }
                      className={`rounded-xl border px-4 py-3 transition-all ${isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-glass-stroke bg-surface-container-low'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() =>
                            toggleMember(
                              member.userId
                            )
                          }
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected
                            ? 'bg-primary border-primary'
                            : 'border-outline'
                            }`}>
                            {isSelected && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>

                          <p className="font-medium text-sm">
                            {
                              fullName
                            }
                          </p>
                        </button>

                        {splitMethod !==
                          'equal' &&
                          isSelected && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={
                                  splitValues[
                                  member.userId
                                  ] || ''
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleSplitValueChange(
                                    member.userId,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                placeholder={
                                  splitMethod ===
                                    'percentage'
                                    ? '%'
                                    : splitMethod ===
                                      'shares'
                                      ? 'shares'
                                      : '100'
                                }
                                className="w-20 bg-black/20 border border-glass-stroke rounded-lg px-3 py-1.5 text-sm outline-none"
                              />

                              {splitMethod ===
                                'percentage' && (
                                  <span className="text-sm text-on-surface-variant">
                                    %
                                  </span>
                                )}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="p-6 border-t border-glass-stroke bg-white/5 flex justify-end gap-3">
          <button
            onClick={() =>
              navigate(-1)
            }
            className="px-5 py-2.5 rounded-lg border border-glass-stroke text-on-surface-variant hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={
              handleSubmit
            }
            disabled={
              isSubmitting
            }
            className="bg-primary-container flex items-center justify-center gap-2 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-container/30 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Split Expense'
            )}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default AddExpenseModal;