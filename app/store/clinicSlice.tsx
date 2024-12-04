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
  clinicImages: { [key: string]: string[] }; // Add this line to store clinic images
  loading: boolean;
  error: string | null;
}

const initialState: ClinicsState = {
  clinicList: [],
  filteredClinicList: [],
  selectedClinic: null,
  clinicImages: {}, // Initialize clinicImages
  loading: false,
  error: null,
};

const fetchFreshClinics = async () => {
  try {
    const response = await axios.get('https://medplus-health.onrender.com/api/clinics');
    const clinics = response.data.map((clinic: Clinic) => ({
      ...clinic,
      images: clinic.images || [],
      professionals: clinic.professionals.map((professional: Professional) => ({
        ...professional,
        clinic_images: professional.clinic_images || [],
      })),
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
    if (state.clinics.clinicList.length > 0) {
      return state.clinics.clinicList;
    }
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
      professionals: clinic.professionals.map((professional: Professional) => ({
        ...professional,
        clinic_images: professional.clinic_images || [],
      })),
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

    // Fetch images for the clinic
    const professionalImages = await Promise.all(
      clinic.professionals.map(async (professional: Professional) => {
        const response = await axios.get(`https://medplus-health.onrender.com/api/images/professional/${professional._id}`);
        const images = response.data.map((image: { urls: string[] }) => image.urls[0]);
        professional.clinic_images = images; // Attach images to the professional
        return images;
      })
    );
    const allImages = new Set(clinic.images || []);
    professionalImages.flat().forEach(url => allImages.add(url));
    clinic.images = Array.from(allImages);

    // Update the Redux state with the fetched clinic data
    dispatch(setSelectedClinic(clinic));
    return clinic;
  }
);

export const clearClinics = createAsyncThunk(
  'clinics/clearClinics',
  async (_, { dispatch }) => {
    await AsyncStorage.removeItem('clinicList');
    dispatch(fetchClinics());
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    filterClinics: (state, action: PayloadAction<{ searchQuery: string }>) => {
      const { searchQuery } = action.payload;
      let filtered = state.clinicList;

      if (searchQuery) {
        filtered = filtered.filter((clinic) =>
          (clinic.name && clinic.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (clinic.address && clinic.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (clinic.category && clinic.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      state.filteredClinicList = filtered;
    },
    clearSelectedClinic: (state) => {
      state.selectedClinic = null;
    },
    resetClinics: (state) => {
      state.clinicList = [];
      state.filteredClinicList = [];
      state.selectedClinic = null;
      state.clinicImages = {}; // Reset clinicImages
      AsyncStorage.removeItem('clinicList');
    },
    setSelectedClinic: (state, action: PayloadAction<Clinic>) => {
      state.selectedClinic = action.payload;
    },
    setClinicImages: (state, action: PayloadAction<{ clinicId: string, images: string[] }>) => {
      state.clinicImages[action.payload.clinicId] = action.payload.images;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinics.fulfilled, (state, action: PayloadAction<Clinic[]>) => {
        state.clinicList = action.payload;
        state.filteredClinicList = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinics';
      })
      .addCase(fetchClinicById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClinicById.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.selectedClinic = action.payload;
        state.loading = false;
      })
      .addCase(fetchClinicById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load clinic details';
      })
      .addCase(clearClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearClinics.fulfilled, (state) => {
        state.clinicList = [];
        state.filteredClinicList = [];
        state.loading = false;
      })
      .addCase(clearClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to clear clinics';
      });
  },
});

export const { setClinics, setLoading, setError, filterClinics, clearSelectedClinic, resetClinics, setSelectedClinic, setClinicImages } = clinicsSlice.actions;

export const selectClinics = createSelector(
  (state: RootState) => state.clinics.filteredClinicList,
  (filteredClinicList) => filteredClinicList
);

export const selectAllClinics = createSelector(
  (state: RootState) => state.clinics.clinicList,
  (clinicList) => clinicList
);

export const selectClinicDetails = createSelector(
  (state: RootState) => state.clinics.selectedClinic,
  (selectedClinic) => selectedClinic
);

export const selectClinicLoading = createSelector(
  (state: RootState) => state.clinics.loading,
  (loading) => loading
);

export const selectClinicError = createSelector(
  (state: RootState) => state.clinics.error,
  (error) => error
);

export const selectSpecialties = createSelector(
  (state: RootState) => state.clinics.clinicList,
  (clinicList) => {
    const specialtiesSet = new Set<string>();
    clinicList.forEach(clinic => {
      if (clinic.specialties) {
        clinic.specialties.split(',').forEach(specialty => specialtiesSet.add(specialty.trim()));
      }
    });
    return Array.from(specialtiesSet);
  }
);

export default clinicsSlice.reducer;