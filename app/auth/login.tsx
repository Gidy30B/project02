import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from "../(services)/api/api";
import { useDispatch } from 'react-redux';
import { loginAction } from '../(redux)/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import LoginWithGoogle from '../../components/LoginWithGoogle';

// Define the validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Too Short!').required('Required'),
});

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const mutation = useMutation({
    mutationFn: loginUser,
    mutationKey: ["login"],
  });

  const handleLoginSuccess = async (data: any) => {
    const user = data.user;
    const [firstName, lastName] = (user.username || "").split(' ');
    const userData = {
      id: user._id, // Extract id from user object
      email: user.email,
      username: user.username || '',
      token: data.token,
      firstName: user.firstName || firstName || '',
      lastName: user.lastName || lastName || '',
      profilePicture: user.profilePicture || '',
      userId: user._id, // Include userId from user object
    };
    try {
      // Remove specific keys from AsyncStorage
      await AsyncStorage.multiRemove(['userId', 'token', 'user']);
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Dispatch loginAction to update the user state
      dispatch(loginAction({ user, token: data.token }));

      // Check if the user has completed the profile
      if (user.completedProfile) {
        router.push('doctor/dashboard');
      } else {
        router.push('profile');
      }
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
    }
  };

  const handleLoginError = (error: any) => {
    let errorMessage = "An error occurred. Please try again.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    setMessage(errorMessage);
    setMessageType("error");
  };

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const imageUrl = "https://res.cloudinary.com/dws2bgxg4/image/upload/v1734385887/loginp_ovgecg.png"; // Replace with your Cloudinary URL

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imageLoaded) {
        setImageError(true);
      }
    }, 6000); // 6000ms timeout

    return () => clearTimeout(timer);
  }, [imageLoaded]);

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
      <View style={{ paddingHorizontal: 25 }}>
        <View style={{ alignItems: 'center' }}>
          {!imageLoaded && !imageError && (
            <Text>Loading image...</Text>
          )}
          {imageError && (
            <Text>Error loading image</Text>
          )}
          <Image
            source={{ uri: imageUrl }}
            style={{ height: screenWidth * 0.75, width: screenWidth * 0.75, transform: [{ rotate: '-5deg' }] }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </View>

        <Text
          style={{
            fontFamily: 'Roboto-Medium',
            fontSize: 28,
            fontWeight: '500',
            color: '#333',
            marginBottom: 30,
          }}>
          Login
        </Text>

        {message && (
          <Text style={{ color: messageType === "error" ? "red" : "green", marginBottom: 20 }}>
            {message}
          </Text>
        )}

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={(values) => {
            console.log('Formik onSubmit triggered with:', values);

            const payload = {
              email: values.email,
              password: values.password,
            };

            mutation
              .mutateAsync(payload)
              .then((data) => {
                console.log('Login successful:', data);
                handleLoginSuccess(data);
              })
              .catch((error) => {
                console.error('Login error:', error);
                handleLoginError(error);
              });
          }}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              <InputField
                label="Email ID"
                icon={
                  <MaterialIcons
                    name="alternate-email"
                    size={20}
                    color="#666"
                    style={{ marginRight: 5 }}
                  />
                }
                keyboardType="email-address"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {errors.email && touched.email && (
                <Text style={{ color: 'red' }}>{errors.email}</Text>
              )}

              <InputField
                label="Password"
                icon={
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#666"
                    style={{ marginRight: 5 }}
                  />
                }
                inputType="password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
              />
              {errors.password && touched.password && (
                <Text style={{ color: 'red' }}>{errors.password}</Text>
              )}

              <CustomButton 
                label="Login" 
                onPress={handleSubmit} 
                isPending={mutation.isLoading}
                isError={mutation.isError}
                isSuccess={mutation.isSuccess}
              />
            </View>
          )}
        </Formik>

        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
          Or, login with ...
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
          <LoginWithGoogle onLoginSuccess={handleLoginSuccess} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 30,
          }}>
          <Text>New to the app?</Text>
          <TouchableOpacity onPress={() => router.push("/auth/registar")}>
            <Text style={{ color: '#AD40AF', fontWeight: '700' }}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
