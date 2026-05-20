import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCurrencyStore = create(
  persist(
    (set) => ({
      currency: 'INR',
      locale: 'en-IN',

      setCurrency: (currency) =>
        set({ currency }),

      setLocale: (locale) =>
        set({ locale }),
    }),
    {
      name: 'currency-storage',
    }
  )
);

export default useCurrencyStore;