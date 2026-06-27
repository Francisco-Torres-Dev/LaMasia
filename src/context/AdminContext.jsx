import { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import StorageService from '../services/StorageService';
import { ADMIN_CREDENTIALS } from '../data/constants';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [session, setSession] = useLocalStorage(StorageService.keys.ADMIN_SESSION, null);

  const login = useCallback((username, password) => {
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const newSession = {
        username,
        role: 'Administrador',
        loginAt: new Date().toISOString(),
      };
      setSession(newSession);
      return { success: true };
    }
    return { success: false, message: 'Credenciales incorrectas' };
  }, [setSession]);

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const isAuthenticated = useMemo(() => !!session, [session]);

  const value = useMemo(
    () => ({ session, login, logout, isAuthenticated }),
    [session, login, logout, isAuthenticated]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe usarse dentro de AdminProvider');
  }
  return context;
};

export default AdminContext;
