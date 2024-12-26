import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  prescription: null,
};

const prescriptionSlice = createSlice({
  name: 'prescription',
  initialState,
  reducers: {
    setPrescription(state, action) {
      state.prescription = action.payload;
    },
    clearPrescription(state) {
      state.prescription = null;
    },
  },
});

export const { setPrescription, clearPrescription } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
