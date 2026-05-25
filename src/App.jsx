import React, { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import authService from './services/authService';
import  CommonToaster from './components/ui/CommonToaster'
function App() {
  useEffect(() => {
    authService.restoreSession();
  }, []);

  return (
    <HashRouter>
      <CommonToaster/>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;