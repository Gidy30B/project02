import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../app/store/userSlice';
import { RootState } from '../app/store/configureStore';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user);
  const [user, setUser] = useState(userState);

  useEffect(() => {
    setUser(userState);
  }, [userState]);

  const loginHandler = (userData: any) => {
    dispatch(login(userData));
    setUser(userData);
  };

  const logoutHandler = () => {
    dispatch(logout());
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);