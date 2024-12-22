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

  const handleLoginSuccess = (data: any) => {
    const [firstName, lastName] = data.username.split(' ');
    const userData = {
      id: data.id,
      email: data.email,
      username: data.username,
      token: data.token,
      firstName: firstName || '',
      lastName: lastName || '',
      profilePicture: data.profilePicture || '',
    };
    dispatch(loginAction(userData));
    router.push('/doctor/dashboard');
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
