import { create } from 'zustand';
import groupService from '../services/groupService';

export const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  isLoading: false,
  error: null,

  createGroup: async (groupData) => {
    set({ isLoading: true, error: null });
    try {
      const newGroup = await groupService.createGroup(groupData);
      if (newGroup) {
        set((state) => ({
          groups: [newGroup?.data, ...state.groups],
          isLoading: false
        }));
      }
      return newGroup;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await groupService.getGroups();
      const groupsArray = Array.isArray(data) ? data : data?.data || [];
      set({ groups: groupsArray, isLoading: false });
      return groupsArray;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchGroupById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await groupService.getGroupById(id);
      const groupObj = data?.data || data;

      set({ currentGroup: groupObj, isLoading: false });
      return groupObj;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  joinGroup: async (joinData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await groupService.joinGroup(joinData);
      await get().fetchGroups();
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * CLEAR CURRENT GROUP
   */
  clearCurrentGroup: () =>
    set({
      currentGroup: null
    }),

  /**
   * CLEAR ERROR
   */
  clearError: () =>
    set({
      error: null
    })
}));