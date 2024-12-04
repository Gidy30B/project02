import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { registerUser } from '@/Services/auth';
import axios from 'axios';
import { fontSizes, windowHeight, windowWidth } from '@/theme/app.constant';

const commonTitles = [
    'General Practitioner',
    'Cardiologist',
    'Neurologist',
    'Dermatologist',
    'Pediatrician',
    'Oncologist',
    'Orthopedic Surgeon',
    'Psychiatrist',
    'Radiologist',
    'Anesthesiologist',
  ];


const SignupScreen: React.FC = () => {
  const router = useRouter();
  const { firstName: queryFirstName, lastName: queryLastName, email: queryEmail, profileImage: queryProfileImage } = router.query || {};

  const [firstName, setFirstName] = useState(queryFirstName || '');
  const [lastName, setLastName] = useState(queryLastName || '');
  const [email, setEmail] = useState(queryEmail || '');
  const [profileImage, setProfileImage] = useState(queryProfileImage || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [userType, setUserType] = useState<'client' | 'professional' | 'student' | null>(null);
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
  const [clinicReferenceCode, setClinicReferenceCode] = useState('');
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

  const handleSignupPress = async () => {
    if (
      firstName === '' ||
      lastName === '' ||
      email === '' ||
      password === '' ||
      confirmPassword === '' ||
      !gender ||
      !userType ||
      (userType === 'professional' && (
        profession === '' ||
        (profession === 'doctor' && title === '') // Validate title if profession is doctor
      ))
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
        userType,
        ...(userType === 'professional' ? { 
          profession,
          ...(profession === 'doctor' ? { title } : {}),
          clinicReferenceCode, // Include clinic reference code
        } : {}),
      };

      await registerUser(userData);
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


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.heading}>Create an Account</Text>
            <Text style={styles.subHeading}>Sign up to get started</Text>

            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : null}

            {!isVerifying ? (
              <>
                <View style={styles.inputContainer}>
                  <Image
                    style={[styles.icon, styles.inputIcon]}
                    source={{ uri: 'https://img.icons8.com/ios/50/000000/user--v1.png' }}
                  />
                  <TextInput
                    style={styles.inputs}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Image
                    style={[styles.icon, styles.inputIcon]}
                    source={{ uri: 'https://img.icons8.com/ios/50/000000/user--v1.png' }}
                  />
                  <TextInput
                    style={styles.inputs}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#888"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Image
                    style={[styles.icon, styles.inputIcon]}
                    source={{ uri: 'https://img.icons8.com/ios/50/000000/new-post.png' }}
                  />
                  <TextInput
                    style={styles.inputs}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Image
                    style={[styles.icon, styles.inputIcon]}
                    source={{ uri: 'https://img.icons8.com/ios/50/000000/lock--v1.png' }}
                  />
                  <TextInput
                    style={styles.inputs}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#888"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Image
                    style={[styles.icon, styles.inputIcon]}
                    source={{ uri: 'https://img.icons8.com/ios/50/000000/lock--v1.png' }}
                  />
                  <TextInput
                    style={styles.inputs}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#888"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.sectionHeader}>Gender</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[styles.genderButton, gender === 'Male' && styles.selectedGender]}
                    onPress={() => setGender('Male')}
                  >
                    <Text style={styles.genderText}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, gender === 'Female' && styles.selectedGender]}
                    onPress={() => setGender('Female')}
                  >
                    <Text style={styles.genderText}>Female</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, gender === 'Other' && styles.selectedGender]}
                    onPress={() => setGender('Other')}
                  >
                    <Text style={styles.genderText}>Other</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionHeader}>Account Type</Text>
                <View style={styles.accountTypeContainer}>
                  <TouchableOpacity
                    style={[styles.accountTypeButton, userType === 'client' && styles.selectedAccountType]}
                    onPress={() => setUserType('client')}
                  >
                    <Text style={styles.accountTypeText}>Client</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.accountTypeButton, userType === 'professional' && styles.selectedAccountType]}
                    onPress={() => setUserType('professional')}
                  >
                    <Text style={styles.accountTypeText}>Professional</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.accountTypeButton, userType === 'student' && styles.selectedAccountType]}
                    onPress={() => setUserType('student')}
                  >
                    <Text style={styles.accountTypeText}>Student</Text>
                  </TouchableOpacity>
                </View>

                {userType === 'professional' && (
                  <>
                    <Picker
                      selectedValue={profession}
                      style={styles.picker}
                      onValueChange={(itemValue) => setProfession(itemValue)}
                    >
                      <Picker.Item label="Select Profession" value="" />
                      <Picker.Item label="Doctor" value="doctor" />
                      <Picker.Item label="Pharmacist" value="pharmacist" />
                    </Picker>

                    {profession === 'doctor' && (
                      <Picker
                        selectedValue={title}
                        style={styles.picker}
                        onValueChange={(itemValue) => setTitle(itemValue)}
                      >
                        <Picker.Item label="Select Title" value="" />
                        {commonTitles.map((title) => (
                          <Picker.Item key={title} label={title} value={title} />
                        ))}
                      </Picker>
                    )}

                    <View style={styles.inputContainer}>
                      <Image
                        style={[styles.icon, styles.inputIcon]}
                        source={{ uri: 'https://img.icons8.com/ios/50/000000/clinic.png' }}
                      />
                      <TextInput
                        style={styles.inputs}
                        placeholder="Clinic Authorization Code"
                        value={clinicReferenceCode}
                        onChangeText={setClinicReferenceCode}
                        placeholderTextColor="#888"
                      />
                    </View>
                  </>
                )}

                {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
                {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

                <Animated.View style={{ transform: [{ scale: buttonAnimation }] }}>
                  <TouchableOpacity
                    style={styles.signupButton}
                    onPress={() => {
                      animateButton();
                      handleSignupPress();
                    }}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.signupButtonText}>Sign Up</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.signupLink}>Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.subHeading}>Enter the verification code sent to your email</Text>
                <View style={styles.inputContainer}>
                  <Image
                    style={[styles.icon, styles.inputIcon]}
                    source={{ uri: 'https://img.icons8.com/ios/50/000000/verification-code.png' }}
                  />
                  <TextInput
                    style={styles.inputs}
                    placeholder="Verification Code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.countdownText}>
                  {countdown > 0 ? `Time remaining: ${countdown}s` : 'Code expired!'}
                </Text>

                {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
                {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}

                <TouchableOpacity style={styles.signupButton} onPress={handleVerificationPress}>
                  <Text style={styles.signupButtonText}>Verify</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c5f0a4',
    padding: windowWidth(20),
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: fontSizes.FONT24,
    fontWeight: 'bold',
    marginBottom: windowHeight(10),
  },
  subHeading: {
    fontSize: fontSizes.FONT16,
    marginBottom: windowHeight(20),
  },
  sectionHeader: {
    fontSize: fontSizes.FONT18,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: windowHeight(10),
    marginLeft: '5%',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: windowWidth(30),
    borderBottomWidth: 1,
    width: '90%',
    height: windowHeight(45),
    marginBottom: windowHeight(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputs: {
    height: windowHeight(45),
    marginLeft: windowWidth(16),
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  icon: {
    width: windowWidth(20), // Adjusted size
    height: windowHeight(20), // Adjusted size
  },
  inputIcon: {
    marginLeft: windowWidth(15),
    justifyContent: 'center',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: windowHeight(25),
    width: '90%',
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    padding: windowWidth(10),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: windowWidth(5),
    marginHorizontal: windowWidth(5),
    backgroundColor: '#f0f0f0',
  },
  selectedGender: {
    backgroundColor: '#cce5ff',
    borderColor: '#007BFF',
  },
  genderText: {
    fontSize: fontSizes.FONT16,
  },
  accountTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: windowHeight(25),
    width: '90%',
  },
  accountTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: windowWidth(10),
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: windowWidth(5),
    marginHorizontal: windowWidth(5),
    backgroundColor: '#f0f0f0',
  },
  selectedAccountType: {
    backgroundColor: '#cce5ff',
    borderColor: '#007BFF',
  },
  accountTypeText: {
    fontSize: fontSizes.FONT16,
  },
  errorMessage: {
    color: 'red',
    marginBottom: windowHeight(10),
  },
  successMessage: {
    color: 'green',
    marginBottom: windowHeight(10),
  },
  signupButton: {
    backgroundColor: '#226b80',
    padding: windowHeight(15),
    borderRadius: windowWidth(30),
    alignItems: 'center',
    width: '90%',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontSizes.FONT16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(20),
  },
  signupText: {
    fontSize: fontSizes.FONT14,
  },
  signupLink: {
    fontSize: fontSizes.FONT14,
    color: '#007BFF',
  },
  countdownText: {
    fontSize: fontSizes.FONT14,
    color: '#888',
    marginBottom: windowHeight(10),
  },
  picker: {
    height: windowHeight(50),
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: windowWidth(30),
    marginBottom: windowHeight(15),
  },
  profileImage: {
    width: windowWidth(100),
    height: windowHeight(100),
    borderRadius: windowWidth(50),
    marginBottom: windowHeight(20),
  },
});

export default SignupScreen;
