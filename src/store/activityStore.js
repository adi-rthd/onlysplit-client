import { create } from 'zustand';

import activityService from '../services/activityService';

export const useActivityStore = create(
  set => ({
    activities: [],

    isLoading: false,

    fetchActivities: async () => {
      try {
        set({
          isLoading: true,
        });

        const activities =
          await activityService.getActivities();

        set({
          activities,
          isLoading: false,
        });
      } catch (error) {
        set({
          isLoading: false,
        });
      }
    },
  })
);