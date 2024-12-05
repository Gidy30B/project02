import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RootState } from './configureStore';

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  user: string;
  profession: string;
  title: string;
  consultationFee: number;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
  attachedToClinic: boolean;
  attachedToPharmacy: boolean;
  clinic_images?: string[];
}

interface Clinic {
  _id: string;
  name: string;
  address: string;
  category: string;
  images?: string[];
  contactInfo: string;
  referenceCode: string;
  professionals: Professional[];
  insuranceCompanies: string[];
  specialties: string;
  experiences: string[];
  languages: string;
  assistantName: string;
  assistantPhone: string;
  bio: string;
  education: {
    course: string;
    university: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ClinicsState {
  clinicList: Clinic[];
  filteredClinicList: Clinic[];
  selectedClinic: Clinic | null;
  clinicImages: { [key: string]: string[] };
  loading: boolean;
  error: string | null;
}

const initialState: ClinicsState = {
  clinicList: [],
  filteredClinicList: [],
  selectedClinic: null,
  clinicImages: {},
  loading: false,
  error: null,
};

const fetchFreshClinics = async () => {
  try {
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    const clinics = response.data.map((clinic: Clinic) => ({
      ...clinic,
      images: clinic.images || [],
      clinicImages: clinic.clinicImages || [], // Ensure clinicImages is populated
    }));
    await AsyncStorage.setItem('clinicList', JSON.stringify(clinics));
  } catch (error) {
    console.error('Failed to fetch fresh clinics', error);
  }
};

export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async (_, { getState }) => {
    const state = getState() as RootState;

    if (state.clinics.clinicList.length > 0) return state.clinics.clinicList;

    const cachedClinics = await AsyncStorage.getItem('clinicList');
    if (cachedClinics) {
      const parsedClinics = JSON.parse(cachedClinics);
      fetchFreshClinics();
      return parsedClinics;
    }

    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    const clinics = response.data.map((clinic: Clinic) => ({
      ...clinic,
      images: clinic.images || [],
      clinicImages: clinic.clinicImages || [], // Ensure clinicImages is populated
    }));

    await AsyncStorage.setItem('clinicList', JSON.stringify(clinics));
    return clinics;
  }
);

export const fetchClinicById = createAsyncThunk(
  'clinics/fetchClinicById',
  async (clinicId: string, { dispatch }) => {
    const cachedClinics = await AsyncStorage.getItem('clinicList');
    const clinics = cachedClinics ? JSON.parse(cachedClinics) : [];

    let clinic = clinics.find((clinic: Clinic) => clinic._id === clinicId);
    if (!clinic) {
      const response = await axios.get(`https://medplus-health.onrender.com/api/clinics/${clinicId}`);
      clinic = response.data;
    }

    // Combine clinicImages with images
    const clinicImages = clinic.clinicImages?.map(image => image.urls[0]) || [];
    clinic.images = Array.from(new Set([...clinic.images, ...clinicImages]));

    // Update the Redux state with the fetched clinic data
    dispatch(setSelectedClinic(clinic));
    return clinic;
  }
);

const clinicsSlice = createSlice({
  name: 'clinics',
  initialState,
  reducers: {
    setClinics: (state, action: PayloadAction<Clinic[]>) => {
      state.clinicList = action.payload;
      state.filteredClinicList = action.payload;
    },
    setSelectedClinic: (state, action: PayloadAction<Clinic>) => {
      state.selectedClinic = action.payload;
    },
    setClinicImages: (state, action: PayloadAction<{ clinicId: string; images: string[] }>) => {
      state.clinicImages[action.payload.clinicId] = action.payload.images;
    },
    filterClinics: (state, action: PayloadAction<string>) => {
      state.filteredClinicList = state.clinicList.filter((clinic) =>
        clinic.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    resetClinics: (state) => {
      state.clinicList = [];
      state.filteredClinicList = [];
      state.selectedClinic = null;
      state.clinicImages = {};
      AsyncStorage.removeItem('clinicList');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchClinics.fulfilled, (state, action: PayloadAction<Clinic[]>) => {
        state.clinicList = action.payload;
        state.filteredClinicList = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch clinics';
      })
      .addCase(fetchClinicById.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.selectedClinic = action.payload;
        state.loading = false;
      });
  },
});

export const { setClinics, setSelectedClinic, setClinicImages, filterClinics, resetClinics } = clinicsSlice.actions;

export const selectClinics = (state: RootState) => state.clinics.filteredClinicList;
export const selectClinicImages = (state: RootState, clinicId: string) => state.clinics.clinicImages[clinicId] || [];
export const selectSelectedClinic = (state: RootState) => state.clinics.selectedClinic;

export const selectClinicDetails = (state: RootState) => state.clinics.selectedClinic;
export const selectClinicLoading = (state: RootState) => state.clinics.loading;
export const selectClinicError = (state: RootState) => state.clinics.error;

export default clinicsSlice.reducer;
