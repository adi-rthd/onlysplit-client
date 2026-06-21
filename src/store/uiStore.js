import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // Modal states
  modals: {
    addExpense: false,
    editExpense: null,  // expense object or null
    createGroup: false,
    editGroup: null,    // group object or null
    inviteGroup: null,  // groupId or null
    expenseDetails: null, // expense object or null
    confirmDelete: null,  // { type, id, name } or null
  },
  openModal: (name, payload = true) =>
    set((s) => ({ modals: { ...s.modals, [name]: payload } })),
  closeModal: (name) =>
    set((s) => ({ modals: { ...s.modals, [name]: typeof s.modals[name] === 'boolean' ? false : null } })),
  closeAllModals: () =>
    set({ modals: { addExpense: false, editExpense: null, createGroup: false, editGroup: null, inviteGroup: null, expenseDetails: null, confirmDelete: null } }),

  // Active tab per page
  tabs: {
    groupDetails: 'expenses',
    friends: 'friends',
  },
  setTab: (page, tab) =>
    set((s) => ({ tabs: { ...s.tabs, [page]: tab } })),

  // Search/filter state
  filters: {
    expenseSearch: '',
    expenseSort: 'recent',
    friendSearch: '',
    groupSearch: '',
    groupSort: 'recent',
  },
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () =>
    set({ filters: { expenseSearch: '', expenseSort: 'recent', friendSearch: '', groupSearch: '', groupSort: 'recent' } }),
}));

export default useUIStore;
