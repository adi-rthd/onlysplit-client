import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Users, Type, Loader2 } from 'lucide-react';
import { useGroupStore } from '../../store/groupStore';
import toast from 'react-hot-toast';
import { currencies } from '../../constants/currencies';

const CreateGroupModal = () => {
  const navigate = useNavigate();
  const { createGroup, isLoading } = useGroupStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('INR');

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Group name is required');
      return;
    }

    try {
      const newGroup = await createGroup({
        name,
        description,
        currency,
        memberEmails: [] // Basic version
      });
      if (newGroup) {
        navigate(`/groups/${newGroup.id || newGroup.groupId || ''}`);
      } else {
        // Fallback
        navigate('/groups');
      }
    } catch (error) {
      // Handled in store
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
          <h2 className="text-xl font-bold">Create Group</h2>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </header>
        
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Group Name</label>
            <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3 focus-within:border-primary transition-colors">
              <Users className="text-outline mr-3" size={20} />
              <input 
                className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none text-on-surface" 
                placeholder="e.g., Goa Trip, Apartment" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Description</label>
            <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3 focus-within:border-primary transition-colors">
              <Type className="text-outline mr-3" size={20} />
              <input 
                className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none text-on-surface" 
                placeholder="What's this group for?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Currency</label>
            <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3">
              <select 
                className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none cursor-pointer appearance-none text-on-surface"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {Object.entries(currencies).map(([code, config]) => (
                  <option key={code} value={code} className="bg-surface-charcoal">
                    {code} ({config.symbol}) - {config.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <footer className="p-6 border-t border-glass-stroke bg-white/5 flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border border-glass-stroke text-on-surface-variant hover:bg-white/5 transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="bg-primary-container flex items-center justify-center gap-2 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-container/30 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Group'}
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
