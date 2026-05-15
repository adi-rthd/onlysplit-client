import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

/**
 * Global providers wrapper.
 * Wraps the entire app with Router, Toaster, and any future providers
 * (QueryClientProvider, ThemeProvider, etc.).
 */
const AppProviders = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2021',
            color: '#e3e2e3',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#E4F222', secondary: '#0D0E10' },
          },
          error: {
            iconTheme: { primary: '#ffb4ab', secondary: '#0D0E10' },
          },
        }}
      />
    </BrowserRouter>
  );
};

export default AppProviders;
