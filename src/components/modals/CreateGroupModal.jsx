import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Users, Loader2, ChevronDown, Check } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { useGroupStore } from '../../store/groupStore';
import toast from 'react-hot-toast';
import { getCurrencies } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';
import { featureFlags } from '../../utils/featureFlags';
import { useCreateGroup } from '../../queries/mutations/useCreateGroup';

const CreateGroupModal = () => {
  const navigate = useNavigate();
  const backdropRef = useRef(null);
  const nameRef = useRef(null);

  const [name, setName] = useState('');
  const { currency: defaultCurrency } = useCurrencyStore();
  const { createGroup, isLoading: legacyLoading } = useGroupStore();
  const [currencies, setCurrencies] = useState([]);
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency || 'INR');

  const useQueryGroups = featureFlags.useQueryGroups;
  const createGroupMutation = useCreateGroup();

  const isLoading = useQueryGroups ? createGroupMutation.isPending : legacyLoading;

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') navigate(-1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Auto-focus name input
  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await getCurrencies();
        setCurrencies(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load currencies');
      }
    };
    fetchCurrencies();
  }, []);

  const selectedCurrency = currencies.find((c) => c.iso_code === currency) || currencies[0];

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    const groupData = {
      name,
      description,
      currency,
      memberEmails: [],
    };

    if (useQueryGroups) {
      createGroupMutation.mutate(groupData, {
        onSuccess: (data) => {
          if (data) {
            navigate(`/groups/${data.id || data.groupId || ''}`);
          } else {
            navigate('/groups');
          }
        },
      });
    } else {
      try {
        const newGroup = await createGroup(groupData);
        if (newGroup) {
          navigate(`/groups/${newGroup.id || newGroup.groupId || ''}`);
        } else {
          navigate('/groups');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to create group');
      }
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[100] !ml-0 !left-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === backdropRef.current && navigate(-1)}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md glass-card rounded-2xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh] overflow-visible"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <h2 className="text-lg font-bold text-on-surface">Create Group</h2>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-5 space-y-5">
          {/* GROUP NAME */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Group Name
            </label>
            <div className="flex items-center gap-3 bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 focus-within:border-primary/40 transition-colors">
              <Users size={16} className="text-on-surface-variant shrink-0" />
              <input
                ref={nameRef}
                type="text"
                placeholder="e.g., Goa Trip"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent border-none ring-0 focus:ring-0 outline-none text-on-surface text-sm placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <input
              type="text"
              placeholder="What's this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface text-sm outline-none ring-0 focus:ring-0 focus:border-primary/40 placeholder:text-on-surface-variant/50 transition-colors"
            />
          </div>

          {/* CURRENCY */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Currency
            </label>

            <Listbox value={currency} onChange={setCurrency}>
              <div className="relative">
                <Listbox.Button className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-left text-on-surface text-sm flex items-center justify-between hover:border-primary/40 transition-colors">
                  <span className="font-medium truncate">
                    {selectedCurrency?.iso_code} ({selectedCurrency?.symbol}) — {selectedCurrency?.name}
                  </span>
                  <ChevronDown size={14} className="text-on-surface-variant shrink-0" />
                </Listbox.Button>

                <Listbox.Options className="absolute bottom-full mb-2 z-[999] max-h-60 w-full overflow-y-auto rounded-xl border border-glass-stroke bg-surface-container shadow-2xl backdrop-blur-xl focus:outline-none py-1 hide-scrollbar">
                  {currencies.map((item) => (
                    <Listbox.Option
                      key={item.iso_code}
                      value={item.iso_code}
                      className={({ active }) =>
                        `cursor-pointer select-none px-4 py-2.5 transition-colors text-sm ${
                          active ? 'bg-primary/10 text-on-surface' : 'text-on-surface-variant'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-center justify-between gap-3">
                          <span className={`truncate ${selected ? 'font-semibold text-on-surface' : ''}`}>
                            {item.iso_code} ({item.symbol}) — {item.name}
                          </span>
                          {selected && <Check size={14} className="text-primary shrink-0" />}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
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
            disabled={isLoading || !name.trim()}
            className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Create Group'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
