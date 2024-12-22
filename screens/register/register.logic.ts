import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { registerUser } from '@/Services/auth';
import { Animated } from 'react-native'; // Add this import

export const useRegisterLogic = () => {
  const router = useRouter();
  const { firstName: queryFirstName, lastName: queryLastName, email: queryEmail, profileImage: queryProfileImage } = router.query || {};

  const [firstName, setFirstName] = useState(queryFirstName || '');
  const [lastName, setLastName] = useState(queryLastName || '');
  const [email, setEmail] = useState(queryEmail || '');
  const [profileImage, setProfileImage] = useState(queryProfileImage || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [profession, setProfession] = useState('');
  const [title, setTitle] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(1));
  const [countdown, setCountdown] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const createFhirPatient = async (userData) => {
    const fhirPatient = {
      resourceType: "Patient",
      name: [
        {
          use: "official",
          family: userData.lastName,
          given: [userData.firstName],
        },
      ],
      gender: userData.gender.toLowerCase(),
      telecom: [
        {
          system: "email",
          value: userData.email,
          use: "home",
        },
      ],
    };
  
    try {
      const response = await axios.post('http://hapi.fhir.org/baseR4/Patient', fhirPatient, {
        headers: {
          'Content-Type': 'application/fhir+json',
        },
      });
      console.log('FHIR Patient created:', response.data);
    } catch (error) {
      console.error('Error creating FHIR Patient:', error);
    }
  };

  const handleSignupPress = async () => {
    if (
      firstName === '' ||
      lastName === '' ||
      email === '' ||
      password === '' ||
      confirmPassword === '' ||
      !gender ||
      profession === '' ||
      (profession === 'doctor' && title === '') // Validate title if profession is doctor
    ) {
      setErrorMessage('Please fill all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsRegistering(true);
    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        gender,
        profession,
        ...(profession === 'doctor' ? { title } : {}),
      };

      await registerUser(userData);
      await createFhirPatient(userData);
      setErrorMessage(null);
      setSuccessMessage('Signup successful! Please check your email for verification.');
      setIsVerifying(true);
      setCountdown(60);
      setTimerActive(true);
    } catch (error) {
      setErrorMessage(error.message || 'Error creating user');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerificationPress = async () => {
    try {
      const response = await axios.post('https://medplus-health.onrender.com/api/verify-email', {
        email,
        verificationCode,
      });

      setErrorMessage(null);
      setSuccessMessage('Verification successful! You can now log in.');
      setIsVerifying(false);
      router.push('/login');
    } catch (error) {
      setErrorMessage('Verification failed. Please try again.');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      setTimerActive(false);
      setErrorMessage('Verification code has expired.');
    }

    return () => clearInterval(timer);
  }, [timerActive, countdown]);

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    profileImage, setProfileImage,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    gender, setGender,
    profession, setProfession,
    title, setTitle,
    verificationCode, setVerificationCode,
    errorMessage, setErrorMessage,
    successMessage, setSuccessMessage,
    isVerifying, setIsVerifying,
    buttonAnimation,
    countdown, setCountdown,
    timerActive, setTimerActive,
    isRegistering, setIsRegistering,
    animateButton,
    handleSignupPress,
    handleVerificationPress,
  };
};