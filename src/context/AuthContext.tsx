import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { initializeAuth, getCurrentUser } from '../store/slices/authSlice';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const initialize = async () => {
      const token = await dispatch(initializeAuth()).unwrap();
      if (token) {
        await dispatch(getCurrentUser()).unwrap();
      }
    };
    initialize();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 