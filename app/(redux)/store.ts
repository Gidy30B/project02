import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './authSlice';
import prescriptionReducer from './prescriptionSlice';
import appointmentsReducer from './appointmentSlice';
import { combineReducers } from 'redux';

const persistConfig: {
  key: string;
  storage: typeof AsyncStorage;
  whitelist: string[];
  serialize: boolean;
  stateReconciler: (inboundState: any, originalState: any) => any;
  transforms: {
    out: (state: any) => any;
    in: (state: any) => any;
  }[];
} = {
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
  // Add the following lines to handle non-serializable values
  transforms: [
    {
      out: (state: any) => {
        const { err, ...rest } = state;
        return rest;
      },
      in: (state: any) => state,
    },
  ],
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