import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
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
  clinicImages?: string[]; // Use clinicImages instead of images
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
    return response.data.map((clinic: Clinic) => ({
      ...clinic,
      clinicImages: clinic.clinicImages?.map(image => image.urls[0]) || [], // Ensure clinicImages is populated
    }));
  } catch (error) {
    console.error('Failed to fetch fresh clinics', error);
    return [];
  }
};

export const fetchClinics = createAsyncThunk(
  'clinics/fetchClinics',
  async () => {
    const clinics = await fetchFreshClinics();
    return clinics;
  }
);

export const fetchClinicById = createAsyncThunk(
  'clinics/fetchClinicById',
  async (clinicId: string, { dispatch }) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/clinics/${clinicId}`);
      const clinic = response.data;

      // Ensure clinicImages is populated
      clinic.clinicImages = clinic.clinicImages?.map(image => image.urls[0]) || [];

      // Update the Redux state with the fetched clinic data
      dispatch(setSelectedClinic(clinic));
      return clinic;
    } catch (error) {
      console.error('Failed to fetch clinic by ID', error);
      return null;
    }
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
      const query = action.payload.toLowerCase();
      state.filteredClinicList = state.clinicList.filter((clinic) =>
        clinic.name.toLowerCase().includes(query)
      );
    },
    resetClinics: (state) => {
      state.clinicList = [];
      state.filteredClinicList = [];
      state.selectedClinic = null;
      state.clinicImages = {};
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
      .addCase(fetchClinicById.fulfilled, (state, action: PayloadAction<Clinic | null>) => {
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
