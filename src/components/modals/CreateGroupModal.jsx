import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Users, Type, Loader2, ChevronDown, Check } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { useGroupStore } from '../../store/groupStore';
import toast from 'react-hot-toast';
import { getCurrencies } from '../../services/currencyService';
import useCurrencyStore from '../../store/useCurrencyStore';

const CreateGroupModal = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const { currency: defaultCurrency } = useCurrencyStore();

  const { createGroup, isLoading } = useGroupStore();
  const [currencies, setCurrencies] = useState([]);
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency || 'INR');

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const data = await getCurrencies();
        setCurrencies(data);
      } catch (error) {
        console.error(error);
        toast.error(
          'Failed to load currencies'
        );
      }
    };

    fetchCurrencies();
  }, []);

  const selectedCurrency =
    currencies.find(
      (c) => c.iso_code === currency
    ) || currencies[0];

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      const newGroup =
        await createGroup({
          name,
          description,
          currency,
          memberEmails: []
        });

      if (newGroup) {
        navigate(`/groups/${newGroup.id || newGroup.groupId || ''}`);
      } else {
        navigate('/groups');
      }
    } catch (error) {
      console.error(error);

      toast.error(
        'Failed to create group'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }}
        className=" w-full max-w-lg bg-surface-charcoal/95 backdrop-blur-2xl border border-glass-stroke rounded-3xl shadow-2xl overflow-visible"
      >
        {/* HEADER */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-glass-stroke bg-white/[0.03]">
          <h2 className="text-2xl font-bold text-on-surface">
            Create Group
          </h2>

          <button
            onClick={() => navigate(-1)}
            className="
              p-2
              rounded-full
              hover:bg-white/10
              transition-colors
            "
          >
            <X size={20} />
          </button>
        </header>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* GROUP NAME */}
          <div className="space-y-2">
            <label className="text-[10px] font-label-caps uppercase text-on-surface-variant">
              Group Name
            </label>

            <div
              className="
                flex
                items-center
                bg-surface-container-low
                border
                border-glass-stroke
                rounded-xl
                px-4
                py-3
                focus-within:border-primary
                transition-colors
              "
            >
              <Users
                className="text-outline mr-3"
                size={20}
              />

              <input
                type="text"
                placeholder="e.g., Goa Trip"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="
                  w-full
                  bg-transparent
                  border-none
                  outline-none
                  text-on-surface
                  placeholder:text-outline
                "
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="text-[10px] font-label-caps uppercase text-on-surface-variant">
              Description
            </label>

            <div
              className="
                flex
                items-center
                bg-surface-container-low
                border
                border-glass-stroke
                rounded-xl
                px-4
                py-3
                focus-within:border-primary
                transition-colors
              "
            >
              <Type
                className="text-outline mr-3"
                size={20}
              />

              <input
                type="text"
                placeholder="What's this group for?"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-transparent
                  border-none
                  outline-none
                  text-on-surface
                  placeholder:text-outline
                "
              />
            </div>
          </div>

          {/* CURRENCY */}
          <div className="space-y-2">
            <label className="text-[10px] font-label-caps uppercase text-on-surface-variant">
              Currency
            </label>

            <Listbox
              value={currency}
              onChange={setCurrency}
            >
              <div className="relative z-50">
                <Listbox.Button
                  className="
                    w-full
                    rounded-xl
                    border
                    border-glass-stroke
                    bg-surface-container-low
                    px-4
                    py-3
                    text-left
                    text-on-surface
                    flex
                    items-center
                    justify-between
                    hover:border-primary/40
                    transition-all
                  "
                >
                  <span className="font-medium truncate">
                    {
                      selectedCurrency?.iso_code
                    }{' '}
                    (
                    {
                      selectedCurrency?.symbol
                    }
                    ) —{' '}
                    {selectedCurrency?.name}
                  </span>

                  <ChevronDown
                    size={18}
                    className="text-outline flex-shrink-0"
                  />
                </Listbox.Button>

                <Listbox.Options className="absolute bottom-full mb-2 z-[999] max-h-72 w-full overflow-y-auto rounded-2xl border border-glass-stroke bg-[#0F1115] shadow-2xl backdrop-blur-xl focus:outline-none py-2">
                  {currencies.map((item) => (
                    <Listbox.Option
                      key={item.iso_code}
                      value={item.iso_code}
                      className={({
                        active
                      }) =>
                        `
                          relative
                          cursor-pointer
                          select-none
                          px-4
                          py-3
                          transition-colors
                          ${active
                          ? 'bg-primary/20 text-white'
                          : 'text-on-surface'
                        }
                        `
                      }
                    >
                      {({ selected }) => (
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium truncate">
                            {item.iso_code}{' '}
                            ({item.symbol}) —{' '}
                            {item.name}
                          </span>

                          {selected && (
                            <Check
                              size={16}
                              className="text-primary flex-shrink-0"
                            />
                          )}
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
        <footer className="flex justify-end gap-3 px-6 py-5 border-t border-glass-stroke bg-white/[0.03]">
          <button
            onClick={() => navigate(-1)}
            className="
              px-5
              py-2.5
              rounded-xl
              border
              border-glass-stroke
              text-on-surface-variant
              hover:bg-white/5
              transition-colors
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="
              bg-primary-container
              flex
              items-center
              justify-center
              gap-2
              text-white
              px-6
              py-2.5
              rounded-xl
              font-bold
              shadow-lg
              shadow-primary-container/30
              hover:opacity-90
              transition-opacity
              disabled:opacity-50
            "
          >
            {isLoading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              'Create Group'
            )}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;