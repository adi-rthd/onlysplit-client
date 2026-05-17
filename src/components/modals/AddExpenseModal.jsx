import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Edit3, Plane, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGroupStore } from '../../store/groupStore';
import { useExpenseStore } from '../../store/expenseStore';
import toast from 'react-hot-toast';

const AddExpenseModal = () => {
  const navigate = useNavigate();
  const { groups, fetchGroups } = useGroupStore();
  const { createExpense, isLoading: isSubmitting } = useExpenseStore();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [splitMethod, setSplitMethod] = useState('equal');

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const handleSubmit = async () => {
    if (!amount || !description || !selectedGroupId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createExpense({
        groupId: selectedGroupId,
        title: description, // Using description as title since the UI only has one input
        description: '',
        amount: parseFloat(amount),
        category: 'General',
        splitType: splitMethod,
        splits: [] // Will be handled by backend or needs member selection UI
      });
      toast.success('Expense added successfully');
      navigate(-1);
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-surface-charcoal/90 backdrop-blur-2xl border border-glass-stroke rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        <header className="flex items-center justify-between px-6 py-5 border-b border-glass-stroke bg-white/5">
          <h2 className="text-xl font-bold">Add Expense</h2>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </header>
        
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] hide-scrollbar">
          <div className="flex flex-col items-center py-4">
            <label className="text-[12px] font-label-caps text-primary tracking-widest mb-2">AMOUNT</label>
            <div className="flex items-center text-5xl font-bold">
              <span className="opacity-50 mr-1">$</span>
              <input 
                type="number" 
                className="bg-transparent border-none p-0 w-40 text-center focus:ring-0 outline-none" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Description</label>
              <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3">
                <Edit3 className="text-outline mr-3" size={20} />
                <input 
                  className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none text-on-surface" 
                  placeholder="What was this for?" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Group</label>
              <div className="flex items-center justify-between bg-surface-container-low border border-glass-stroke rounded-lg p-3">
                <div className="flex items-center gap-3 w-full">
                  <Plane className="text-secondary" size={20} />
                  <select 
                    className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none cursor-pointer appearance-none"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    {groups.length === 0 ? (
                      <option value="">No groups available</option>
                    ) : (
                      groups.map(g => (
                        <option key={g.id} value={g.id} className="bg-surface-charcoal text-on-surface">{g.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <ChevronsUpDown size={20} className="text-outline pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Split Method</label>
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-glass-stroke">
              <button onClick={() => setSplitMethod('equal')} className={`flex-1 py-2 rounded-lg font-medium text-xs transition-colors ${splitMethod === 'equal' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Equally</button>
              <button onClick={() => setSplitMethod('percentage')} className={`flex-1 py-2 rounded-lg font-medium text-xs transition-colors ${splitMethod === 'percentage' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Percent</button>
              <button onClick={() => setSplitMethod('exact')} className={`flex-1 py-2 rounded-lg font-medium text-xs transition-colors ${splitMethod === 'exact' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Exact</button>
              <button onClick={() => setSplitMethod('shares')} className={`flex-1 py-2 rounded-lg font-medium text-xs transition-colors ${splitMethod === 'shares' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>Shares</button>
            </div>
          </div>
        </div>
        
        <footer className="p-6 border-t border-glass-stroke bg-white/5 flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border border-glass-stroke text-on-surface-variant hover:bg-white/5 transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-primary-container flex items-center justify-center gap-2 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-container/30 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Split Expense'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default AddExpenseModal;
