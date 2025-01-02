import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice';
import prescriptionReducer from './prescriptionSlice';
import appointmentsReducer from './appointmentSlice';
import { combineReducers } from 'redux';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist the auth reducer
  serialize: false, // Disable serialization check
  stateReconciler: (inboundState: any, originalState: any) => {
    return {
      ...originalState,
      ...inboundState,
      err: undefined, // Ignore the err field
    };
  },
};

const rootReducer = combineReducers({
  auth: authReducer,
  prescription: prescriptionReducer,
  appointments: appointmentsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;