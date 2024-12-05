import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './configureStore';
import axios from 'axios';

interface Professional {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  user: string;
  profession: string;
  certifications: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  clinic: string;
  attachedToClinic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  name: string | null;
  email: string | null;
  userId: string | null;
  userType: 'client' | 'professional' | 'student' | null;
  isAuthenticated: boolean;
  professional: Professional | null;
  profileImage: string | null;
}

const initialState: UserState = {
  name: null,
  email: null,
  userId: null,
  userType: null,
  isAuthenticated: false,
  professional: null,
  profileImage: null,
};

// Action to fetch the user's profile image from the server (this is still handled in the slice)
export const fetchProfileImage = createAsyncThunk(
  'user/fetchProfileImage',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `https://medplus-health.onrender.com/api/images/user/${userId}`
      );
      if (response.data.length > 0) {
        const randomImage = response.data[Math.floor(Math.random() * response.data.length)];
        return randomImage.urls[0];
      } else {
        return null;
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        userId: string;
        userType: 'client' | 'professional' | 'student';
        professional?: Professional | null;
        profileImage?: string | null;
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.userId = action.payload.userId; 
      state.userType = action.payload.userType;
      state.isAuthenticated = true; // Set the user as authenticated
      state.professional = action.payload.professional || null;
      state.profileImage = action.payload.profileImage || null;
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.userId = null;
      state.userType = null;
      state.isAuthenticated = false; // Reset the authentication flag
      state.professional = null;
      state.profileImage = null;
    },
    // Action to update the user profile in state (e.g., name, email, etc.)
    updateUserProfile(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },

    // Action to update the 'attachedToClinic' property within the professional profile
    updateAttachedToClinic(state, action: PayloadAction<boolean>) {
      if (state.professional) {
        state.professional.attachedToClinic = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProfileImage.fulfilled, (state, action) => {
      state.profileImage = action.payload;
    });
    builder.addCase(fetchProfileImage.rejected, (state, action) => {
      console.error('Error fetching profile image:', action.payload);
    });
  },
});

export const selectUser = (state: RootState) => state.user;

export const { login, logout, updateUserProfile, updateAttachedToClinic } = userSlice.actions;

export default userSlice.reducer;
