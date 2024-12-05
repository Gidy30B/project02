import React, { useState, useContext, createRef } from 'react';
import { StyleSheet, TextInput, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import GlobalApi from '../../Services/GlobalApi';
import { useDispatch } from 'react-redux';
import { login } from '../../app/store/userSlice'; // Redux action
import { AuthContext } from '../../context/AuthContext'; // AuthContext
import Icon from 'react-native-vector-icons/Ionicons';
import { fontSizes, windowHeight, windowWidth } from '@/theme/app.constant';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const passwordInputRef = createRef<TextInput>();
  const router = useRouter();
  const dispatch = useDispatch(); // Redux hook
  const { login: authLogin } = useContext(AuthContext); // AuthContext

  // Handle login logic
  const handleLoginPress = async () => {
    if (email === '' || password === '') {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await GlobalApi.loginUser(email, password);

      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      setErrorMessage(null);

      const { token, userId, firstName, lastName, email: userEmail, userType, doctorId, professional, profileImage, riderId } = response.data;

      if (!firstName || !lastName) {
        console.error('First name or last name is missing:', { firstName, lastName });
      }

      // Redux action to store user details
      dispatch(login({
        name: `${firstName} ${lastName}`,
        email: userEmail,
        userId,
        userType,
        professional,
        profileImage,
        riderId,
      }));


      authLogin({
        name: `${firstName} ${lastName}`,
        email: userEmail,
        userId,
        userType,
        professional,
        profileImage,
        riderId,
      });

    
      setTimeout(() => {
        let route = '';
        switch (userType) {
          case 'professional':
            if (professional && professional.profession === 'doctor') {
              route = professional.attachedToClinic ? '/doctor' : '/addclinic';
            } else if (professional && professional.profession === 'pharmacist' && !professional.attachedToPharmacy) {
              route = '/addpharmacy';
            } else if (professional && professional.profession === 'pharmacist') {
              route = '/pharmacist/tabs';
            } else {
              route = '/professional';
            }
            break;
          case 'client':
            route = '/client/home';
            break;
          case 'student':
            route = '/student/tabs';
            break;
          case 'rider':
            route = '/rider/tabs';
            break;
          default:
            route = '/student/tabs';
        }  

        router.push(route);
      }, 0);
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Invalid email or password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={{ uri: 'https://example.com/logo.png' }} style={styles.logo} />
      </View>
      <Text style={styles.heading}>Welcome Back!</Text>
      <TextInput
        style={[styles.input, errorMessage && styles.inputError]}
        placeholder="Email"
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={!showPassword}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#333" />
        </TouchableOpacity>
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity
        style={[styles.button, isLoggingIn && styles.buttonDisabled]}
        onPress={handleLoginPress}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.registerText}>New here? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#c5f0a4',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#226b80',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonDisabled: {
    backgroundColor: '#b3cde0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    textAlign: 'center',
    color: '#226b80',
    fontSize: 14,
    marginTop: 10,
  },
});
