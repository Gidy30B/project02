import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from './configureStore';
import { createSelector } from 'reselect';

// Async thunk to fetch doctors
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { dispatch }) => {
    const cachedDoctors = await AsyncStorage.getItem('doctorList');
    if (cachedDoctors) {
      const parsedDoctors = JSON.parse(cachedDoctors);
      fetchFreshDoctors();
      return parsedDoctors;
    }
    const response = await axios.get('https://medplus-health.onrender.com/api/professionals');
    
    // Transform response to include insurance companies from the clinic
    const doctorsWithInsurance = response.data.map((doctor: any) => ({
      ...doctor,
      clinic: doctor.clinicId,  // Attach the entire clinic object here
    }));
    
    await AsyncStorage.setItem('doctorList', JSON.stringify(doctorsWithInsurance));
    return doctorsWithInsurance;
  }
);

const fetchFreshDoctors = async () => {
  try {
    const response = await axios.get('https://medplus-health.onrender.com/api/professionals');
    await AsyncStorage.setItem('doctorList', JSON.stringify(response.data));
  } catch (error) {
    console.error('Failed to fetch fresh doctors', error);
  }
};

// Doctor interface
interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  consultationFee: number;
  clinic: {
    name: string;
    insuranceCompanies: string[];  // Add insuranceCompanies as part of clinic data
  };
}


// Doctors state interface
interface DoctorsState {
  doctorList: Doctor[];
  selectedDoctor: Doctor | null;  // Store selected doctor
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DoctorsState = {
  doctorList: [],
  selectedDoctor: null,  // Initialize as null
  loading: false,
  error: null,
};

// Doctor slice
const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setSelectedDoctor(state, action: PayloadAction<Doctor>) {
      state.selectedDoctor = action.payload;  // Set selected doctor
    },
    clearSelectedDoctor(state) {
      state.selectedDoctor = null;  // Clear selected doctor
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
        state.doctorList = action.payload;
        state.loading = false;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load doctors';
      });
  },
});

// Action exports
export const { setSelectedDoctor, clearSelectedDoctor } = doctorsSlice.actions;

// Selector to select all doctors
export const selectDoctors = createSelector(
  (state: RootState) => state.doctors.doctorList,
  (doctorList) => doctorList
);

// Selector to select the current selected doctor
export const selectSelectedDoctor = (state: RootState) => state.doctors.selectedDoctor;

export default doctorsSlice.reducer;
