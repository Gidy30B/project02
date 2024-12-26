import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import prescriptionReducer from './prescriptionSlice';
import appointmentsReducer from './appointmentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    prescription: prescriptionReducer,
    appointments: appointmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;