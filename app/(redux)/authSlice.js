import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from 'axios';

// Function to load user from AsyncStorage
export const loadUserFromStorage = async () => {
  try {
    const userInfo = await AsyncStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error("Failed to load user info", error);
    return null;
  }
};

// Action to fetch the user's profile image from the server
export const fetchProfileImage = createAsyncThunk(
  'user/fetchProfileImage',
  async (userId, { rejectWithValue }) => {
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

const initialState = {
  user: null,
  loading: true,
  name: null,
  email: null,
  userId: null,
  userType: null,
  isAuthenticated: false,
  professional: null,
  profileImage: null,
  profileData: {
    fullName: '',
    dob: '',
    gender: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    emergencyContact: '',
  },
  insuranceData: {
    insuranceProvider: '',
    insuranceNumber: '',
    groupNumber: '',
    policyholderName: '',
    relationshipToPolicyholder: '',
    effectiveDate: '',
    expirationDate: '',
    insuranceCardImage: null,
  },
};

const authSlice = createSlice({
  name: "medplus",
  initialState,
  reducers: {
    loginAction: (state, action) => {
      const { user, token } = action.payload;
      if (user) {
        state.user = {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userId: user._id,
          token: token,
          username: user.username,
          preferences: user.preferences,
          isVerified: user.isVerified,
          loginMethod: user.loginMethod,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        state.name = user.firstName + ' ' + user.lastName;
        state.email = user.email;
        state.userId = user._id;
        state.userType = user.userType;
        state.isAuthenticated = true;
        state.professional = user.professional || null;
        state.profileImage = user.profileImage || null;
        state.loading = false;
        AsyncStorage.setItem("userInfo", JSON.stringify(state.user));
      }
    },
    logoutAction: (state) => {
      Object.assign(state, initialState); // Reset state to initial values
      AsyncStorage.removeItem("userInfo");
      AsyncStorage.removeItem('profileImage');
    },
    setUser: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.name = user.firstName + ' ' + user.lastName;
      state.email = user.email;
      state.userId = user._id;
      state.userType = user.userType;
      state.isAuthenticated = true;
      state.professional = user.professional || null;
      state.profileImage = user.profileImage || null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateUserProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateAttachedToClinic: (state, action) => {
      if (state.professional) {
        state.professional.attachedToClinic = action.payload;
      }
    },
    setProfileImage: (state, action) => {
      state.profileImage = action.payload;
    },
    updateProfile: (state, action) => {
      state.profileData = {
        ...state.profileData,
        ...action.payload,
        address: {
          ...state.profileData.address,
          ...action.payload.address,
        },
      };
    },
    updateInsurance: (state, action) => {
      state.insuranceData = action.payload; 
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

export const selectUser = (state) => ({
  ...state.auth,
  profileImage: state.auth.profileImage,
});

export const { loginAction, logoutAction, setUser, setLoading, updateUserProfile, updateAttachedToClinic, setProfileImage, updateProfile, updateInsurance } = authSlice.actions;

export default authSlice.reducer;

export const loadUser = () => async (dispatch) => {
  const user = await loadUserFromStorage();
  if (user) {
    dispatch(setUser(user));
  } else {
    dispatch(setLoading(false));
  }
};