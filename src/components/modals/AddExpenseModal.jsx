import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Edit3, Plane, ChevronsUpDown } from 'lucide-react';

const AddExpenseModal = () => {
  const navigate = useNavigate();
  
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
              <input type="number" className="bg-transparent border-none p-0 w-40 text-center focus:ring-0 outline-none" defaultValue="120.50" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Description</label>
              <div className="flex items-center bg-surface-container-low border border-glass-stroke rounded-lg p-3">
                <Edit3 className="text-outline mr-3" size={20} />
                <input className="bg-transparent border-none p-0 w-full focus:ring-0 outline-none text-on-surface" defaultValue="Dinner at Sushi Roku" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Group</label>
              <div className="flex items-center justify-between bg-surface-container-low border border-glass-stroke rounded-lg p-3 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Plane className="text-secondary" size={20} />
                  <span>Tokyo Trip 2024</span>
                </div>
                <ChevronsUpDown size={20} className="text-outline" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Split Method</label>
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-glass-stroke">
              <button className="flex-1 py-2 rounded-lg bg-primary-container text-white font-medium text-xs shadow-sm">Equally</button>
              <button className="flex-1 py-2 rounded-lg text-xs text-on-surface-variant hover:text-on-surface transition-colors">Percentage</button>
              <button className="flex-1 py-2 rounded-lg text-xs text-on-surface-variant hover:text-on-surface transition-colors">Exact</button>
            </div>
          </div>
        </div>
        
        <footer className="p-6 border-t border-glass-stroke bg-white/5 flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border border-glass-stroke text-on-surface-variant hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={() => navigate(-1)} className="bg-primary-container text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-container/30 hover:opacity-90 transition-opacity">Split Expense</button>
        </footer>
      </motion.div>
    </div>
  );
};

export default AddExpenseModal;
