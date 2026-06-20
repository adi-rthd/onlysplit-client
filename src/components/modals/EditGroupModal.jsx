/**
 * Edit Group Modal — allows the group owner to update name, description, and currency.
 * Only sends changed fields to the API (partial update).
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGroupStore } from '../../store/groupStore';
import { getCurrencies } from '../../services/currencyService';

const EditGroupModal = ({ group, onClose, onUpdated }) => {
  const { updateGroup } = useGroupStore();

  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [currency, setCurrency] = useState(group?.currency || 'INR');
  const [currencies, setCurrencies] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrencies().then((data) => {
      if (data) setCurrencies(data);
    });
  }, []);

  // Validation
  const validate = () => {
    if (!name.trim()) {
      toast.error('Group name is required.');
      return false;
    }
    if (name.trim().length > 160) {
      toast.error('Group name must be under 160 characters.');
      return false;
    }
    if (description.length > 500) {
      toast.error('Description must be under 500 characters.');
      return false;
    }
    if (currency && !/^[A-Z]{3}$/.test(currency)) {
      toast.error('Currency must be exactly 3 uppercase letters.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // Only send changed fields
    const updates = {};
    if (name.trim() !== (group.name || '')) updates.name = name.trim();
    if (description !== (group.description || '')) updates.description = description;
    if (currency !== (group.currency || '')) updates.currency = currency;

    if (Object.keys(updates).length === 0) {
      toast('No changes to save.');
      onClose();
      return;
    }

    setSaving(true);
    try {
      await updateGroup(group.id, updates);
      onUpdated?.();
      onClose();
    } catch (err) {
      // Error toast handled by groupService/apiErrorHandler
    } finally {
      setSaving(false);
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
        className="w-full max-w-md glass-card rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-primary" />
            <h2 className="text-lg font-bold text-on-surface">Edit Group</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
          {/* Name */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              maxLength={160}
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface outline-none ring-0 focus:ring-0 focus:border-primary/40 placeholder:text-on-surface-variant/50 text-sm transition-colors"
              placeholder="Trip to Goa 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-[11px] text-on-surface-variant/50 mt-1 text-right">
              {name.length}/160
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              maxLength={500}
              rows={3}
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface outline-none ring-0 focus:ring-0 focus:border-primary/40 placeholder:text-on-surface-variant/50 text-sm transition-colors resize-none"
              placeholder="Beach vacation with friends..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-[11px] text-on-surface-variant/50 mt-1 text-right">
              {description.length}/500
            </p>
          </div>

          {/* Currency */}
          <div>
            <label className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">
              Currency
            </label>
            <select
              className="w-full bg-surface-container-low border border-glass-stroke rounded-xl px-4 py-3 text-on-surface outline-none appearance-none cursor-pointer text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {currencies.length > 0 ? (
                currencies.map((c) => (
                  <option key={c.iso_code || c.code} value={c.iso_code || c.code} className="bg-surface-charcoal text-on-surface">
                    {c.iso_code || c.code} — {c.name || c.currency}
                  </option>
                ))
              ) : (
                <>
                  <option value="INR" className="bg-surface-charcoal">INR — Indian Rupee</option>
                  <option value="USD" className="bg-surface-charcoal">USD — US Dollar</option>
                  <option value="EUR" className="bg-surface-charcoal">EUR — Euro</option>
                  <option value="GBP" className="bg-surface-charcoal">GBP — British Pound</option>
                </>
              )}
            </select>
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
            disabled={saving || !name.trim()}
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

export default EditGroupModal;
