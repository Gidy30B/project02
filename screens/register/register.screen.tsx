import React, { useState } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { Text, HelperText } from 'react-native-paper';
import { theme } from '../../core/theme';
import Background from '../../components/login/Background';
import Logo from '../../components/login/Logo';
import Header from '../../components/login/Header';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { useRouter } from 'expo-router';
import { useRegisterLogic } from './register.logic';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    gender, setGender,
    profession, setProfession,
    title, setTitle,
    verificationCode, setVerificationCode,
    errorMessage, setErrorMessage,
    successMessage,
    isVerifying,
    buttonAnimation,
    isRegistering,
    handleSignupPress,
    handleVerificationPress,
  } = useRegisterLogic();

  const handleInputChange = (field, value) => {
    switch (field) {
      case 'firstName': setFirstName(value); break;
      case 'lastName': setLastName(value); break;
      case 'email': setEmail(value); break;
      case 'password': setPassword(value); break;
      case 'confirmPassword': setConfirmPassword(value); break;
      case 'gender': setGender(value); break;
      case 'profession': setProfession(value); break;
      case 'title': setTitle(value); break;
      case 'verificationCode': setVerificationCode(value); break;
      default: break;
    }
  };

  const handleNext = () => {
    if (step === 3) {
      handleSignupPress();
    } else {
      setStep(step + 1);
    }
  };

  const renderStep = () => {
    if (isVerifying) {
      return (
        <>
          <InputField
            label="Verification Code"
            value={verificationCode}
            onChangeText={(value) => handleInputChange('verificationCode', value)}
          />
        </>
      );
    }

    switch (step) {
      case 1:
        return (
          <>
            <InputField
              label="First Name"
              value={firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
            />
            <HelperText type="error" visible={!!errorMessage}>
              {errorMessage}
            </HelperText>
            <InputField
              label="Last Name"
              value={lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
            />
          </>
        );
      case 2:
        return (
          <>
            <InputField
              label="Email"
              value={email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
            <InputField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
            />
          </>
        );
      case 3:
        return (
          <>
            <InputField
              label="Gender"
              value={gender}
              onChangeText={(value) => handleInputChange('gender', value)}
            />
            <InputField
              label="Profession"
              value={profession}
              onChangeText={(value) => handleInputChange('profession', value)}
            />
            {profession === 'doctor' && (
              <InputField
                label="Title"
                value={title}
                onChangeText={(value) => handleInputChange('title', value)}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        <Logo />
        <Header>Create Account</Header>
        {renderStep()}
        <Animated.View style={{ transform: [{ scale: buttonAnimation }], marginTop: 16 }}>
          <CustomButton mode="contained" onPress={isVerifying ? handleVerificationPress : handleNext} loading={isRegistering}>
            {isVerifying ? 'Verify' : (step === 3 ? 'Sign Up' : 'Next')}
          </CustomButton>
        </Animated.View>
        {!isVerifying && (
          <View style={styles.row}>
            <Text>Already have an account? </Text>
            <Text style={styles.link} onPress={() => router.push('/login')}>
              Login
            </Text>
          </View>
        )}
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'center',
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
