import React from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <HashRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        toastOptions={{
          duration: 3000,

          style: {
            background: '#111111',
            color: '#fff',
            border:
              '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
            padding: '14px 16px',
          },
        }}
      />
      <AppRoutes />
    </HashRouter>
  );
}

export default App;