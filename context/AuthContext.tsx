
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../app/store/userSlice'; // Assuming userSlice is in store
import { RootState } from '../app/store/configureStore'; // Adjust path if needed

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  
  // Get user state from Redux
  const userState = useSelector((state: RootState) => state.user);

  // Sync the user data with local component state (to be passed via context)
  const [user, setUser] = useState(userState);

  useEffect(() => {
    // Sync context state with Redux state when Redux state changes
    setUser(userState);
  }, [userState]);

  // Handle login by dispatching the Redux login action
  const loginHandler = (userData: any) => {
    dispatch(
      login({
        name: userData.name,
        email: userData.email,
        userId: userData.userId,
        userType: userData.userType,
        professional: userData.professional,
        profileImage: userData.profileImage,
      })
    );
  };

  // Handle logout by dispatching the Redux logout action
  const logoutHandler = () => {
    dispatch(logout()); // Reset Redux state to logged out
    setUser(null); // Clear context state to reflect logout
  };

  return (
    <AuthContext.Provider value={{ user, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access AuthContext in your components
export const useAuthContext = () => {
  return useContext(AuthContext);
};