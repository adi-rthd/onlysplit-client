import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, DollarSign, Loader2 } from 'lucide-react';
import { useSettlementStore } from '../../store/settlementStore';
import toast from 'react-hot-toast';
import useCurrencyStore from '../../store/useCurrencyStore';
import { useGroupStore } from '../../store/groupStore';

const SettleUpModal = ({ groupId, payerId, receiverId, defaultAmount = 0, onClose }) => {
  const navigate = useNavigate();
  const { createSettlement } = useSettlementStore();
  const { currency: storeCurrency } = useCurrencyStore();
  const { groups } = useGroupStore();

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') (onClose ? onClose() : navigate(-1)); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, navigate]);  const group = groups?.find(g => g.id === groupId);
  const currencyCode = group?.currency || storeCurrency || 'INR';

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return code;
    }
  };
  const currencySymbol = getCurrencySymbol(currencyCode);
  
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      // Assuming settlementService is imported directly or available in store.
      // Here we will use the store if we add it, otherwise we would use settlementService.
      // Let's assume we use the service directly for simplicity or we should add it to the store.
      const { default: settlementService } = await import('../../services/settlementService');
      const data = await settlementService.createSettlement({
        groupId,
        payerId,
        receiverId,
        amount: parseFloat(amount),
        note
      });
      
      if (data) {
        onClose && onClose(true);
      }
    } catch (error) {
      // Handled in service
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] !ml-0 !left-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && (onClose ? onClose() : navigate(-1))}>
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm glass-card rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-glass-stroke backdrop-blur-xl bg-white/[0.03]">
          <h2 className="text-lg font-bold">Settle Up</h2>
          <button onClick={() => onClose && onClose(false)} className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={16} className="text-on-surface-variant" />
          </button>
        </header>
        
        <div className="p-6 space-y-5">
          <div className="flex flex-col items-center py-4">
            <label className="text-[12px] font-label-caps text-primary tracking-widest mb-2">AMOUNT</label>
            <div className="flex items-center text-5xl font-bold">
              <span className="opacity-50 mr-1">{currencySymbol}</span>
              <input 
                type="number" 
                className="bg-transparent border-none p-0 w-40 text-center focus:ring-0 outline-none text-on-surface" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Note</label>
            <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3">
              <input 
                className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none text-on-surface" 
                placeholder="e.g., Paid via UPI" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <footer className="p-6 border-t border-glass-stroke bg-white/5 flex justify-end gap-3">
          <button onClick={() => onClose && onClose(false)} className="px-5 py-2.5 rounded-lg border border-glass-stroke text-on-surface-variant hover:bg-white/5 transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-primary-container flex items-center justify-center gap-2 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-container/30 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Record Payment'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default SettleUpModal;
