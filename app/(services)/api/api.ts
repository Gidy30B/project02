import axios from "axios";

const API_URL = "https://project03-rj91.onrender.com";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
  userType: string; // Add userType to RegisterData interface
}

interface UserData {
  // Define the structure of userData if known
  [key: string]: any;
}

// login
const loginUser = async ({ email, password }: LoginData): Promise<any> => {
  const response = await axios.post(`${API_URL}/api/users/login`, {
    email,
    password,
  });
  return response.data;
};

// register
const registerUser = async (data: RegisterData): Promise<any> => {
  console.log("Data being sent to API:", data); // Add this line to log the data being sent to the API
  const response = await axios.post(`${API_URL}/api/users/register`, data);
  return response.data;
};

// Google login
const googleLoginUser = async (userData: UserData): Promise<any> => {
  const response = await axios.post(`${API_URL}/api/users/google-login`, userData);
  return response.data;
};

const setPassword = async (token: string, password: string): Promise<any> => {
  const response = await axios.post(
    `${API_URL}/api/users/set-password`,
    { password },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// export the functions
export { loginUser, registerUser, googleLoginUser, setPassword };

export default {
  loginUser,
  registerUser,
  googleLoginUser,
  setPassword,
};