import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAction, logoutAction  } from '../app/(redux)/authSlice';
import { RootState } from '../app/(redux)/store';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.auth.user);
  const [user, setUser] = useState(userState);

  useEffect(() => {
    setUser(userState);
  }, [userState]);

  const loginHandler = (userData: any) => {
    dispatch(loginAction(userData));
    setUser(userData);
  };

  const logoutHandler = () => {
    dispatch(logoutAction());
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);