import React, { useState, useEffect, createRef, RefObject } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Keyboard, ScrollView } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../(services)/api/api";
import axios from "axios";
import Loader from "../../components/Loader";
import LoginWithGoogle from '../../components/LoginWithGoogle';
import Background from "../../components/Background";
import Logo from "../../components/Logo";
import Header from "../../components/Header";
import Button from "../../components/Button";
import BackButton from "../../components/BackButton";
import { theme } from "../../core/theme";
import TextInput from "@/components/TextInput";

interface RegisterValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  userType: string;
}

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
  confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match").required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
  userType: Yup.string().required("Required"),
});

export default function Register({ navigation }) {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const emailInputRef: RefObject<typeof TextInput> = createRef();
  const passwordInputRef: RefObject<typeof TextInput> = createRef();
  const firstNameInputRef: RefObject<typeof TextInput> = createRef();
  const lastNameInputRef: RefObject<typeof TextInput> = createRef();
  const confirmPasswordInputRef: RefObject<typeof TextInput> = createRef();

  const mutation = useMutation({
    mutationFn: registerUser,
    mutationKey: ["register"],
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    if (countdown === 0) {
      setTimerActive(false);
      setMessage("Verification code has expired.");
      setMessageType("error");
    }

    return () => clearInterval(timer);
  }, [timerActive, countdown]);

  const imageUrl = "https://res.cloudinary.com/dws2bgxg4/image/upload/v1734385887/loginp_ovgecg.png"; // Replace with your Cloudinary URL

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome.</Header>
      <Loader loading={loading} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ justifyContent: 'center', alignContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <Image source={{ uri: imageUrl }} style={{ width: '50%', height: 100, resizeMode: 'contain', margin: 30 }} />
        </View>
        <KeyboardAvoidingView enabled>
          <Formik
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              firstName: "",
              lastName: "",
              userType: "professional", // Default userType
            }}
            validationSchema={RegisterSchema}
            onSubmit={(values: RegisterValues) => {
              const data = {
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                userType: values.userType, // Include userType in payload
              };
              setLoading(true);
              mutation.mutateAsync(data)
                .then(() => {
                  setMessage("Registration successful! Please check your email for verification.");
                  setMessageType("success");
                  setIsVerifying(true);
                  setCountdown(60);
                  setTimerActive(true);
                  setLoading(false);
                })
                .catch((error) => {
                  setMessage(error?.response?.data?.message);
                  setMessageType("error");
                  setLoading(false);
                });
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => {
              const handleVerificationPress = async () => {
                try {
                  const response = await axios.post('https://medplus-health.onrender.com/api/users/verify-email', {
                    email: values.email,
                    verificationCode,
                  });

                  setMessage("Verification successful! You can now log in.");
                  setMessageType("success");
                  setIsVerifying(false);
                  router.push('/auth/login');
                } catch (error) {
                  setMessage("Verification failed. Please try again.");
                  setMessageType("error");
                }
              };

              return (
                <View style={styles.form}>
                  {!isVerifying ? (
                    <>
                      <TextInput
                        label="First Name"
                        returnKeyType="next"
                        value={values.firstName}
                        onChangeText={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                        error={!!errors.firstName && touched.firstName}
                        errorText={errors.firstName}
                        ref={firstNameInputRef}
                        onSubmitEditing={() => lastNameInputRef.current && lastNameInputRef.current.focus()}
                      />
                      <TextInput
                        label="Last Name"
                        returnKeyType="next"
                        value={values.lastName}
                        onChangeText={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                        error={!!errors.lastName && touched.lastName}
                        errorText={errors.lastName}
                        ref={lastNameInputRef}
                        onSubmitEditing={() => emailInputRef.current && emailInputRef.current.focus()}
                      />
                      <TextInput
                        label="Email"
                        returnKeyType="next"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        error={!!errors.email && touched.email}
                        errorText={errors.email}
                        autoCapitalize="none"
                        autoCompleteType="email"
                        textContentType="emailAddress"
                        keyboardType="email-address"
                        ref={emailInputRef}
                        onSubmitEditing={() => passwordInputRef.current && passwordInputRef.current.focus()}
                      />
                      <TextInput
                        label="Password"
                        returnKeyType="next"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        error={!!errors.password && touched.password}
                        errorText={errors.password}
                        secureTextEntry
                        ref={passwordInputRef}
                        onSubmitEditing={() => confirmPasswordInputRef.current && confirmPasswordInputRef.current.focus()}
                      />
                      <TextInput
                        label="Confirm Password"
                        returnKeyType="done"
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                        error={!!errors.confirmPassword && touched.confirmPassword}
                        errorText={errors.confirmPassword}
                        secureTextEntry
                        ref={confirmPasswordInputRef}
                        onSubmitEditing={Keyboard.dismiss}
                      />
                      <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 24 }}>
                        Register
                      </Button>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
                        <LoginWithGoogle onLoginSuccess={() => router.push('/(client)')} />
                      </View>
                      <View style={styles.row}>
                        <Text>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push("/auth/login")}>
                          <Text style={styles.link}> Login</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.subHeading}>Enter the verification code sent to your email</Text>
                      <TextInput
                        label="Verification Code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="numeric"
                      />
                      <Text style={styles.countdownText}>
                        {countdown > 0 ? `Time remaining: ${countdown}s` : 'Code expired!'}
                      </Text>
                      <Button mode="contained" onPress={handleVerificationPress} style={{ marginTop: 24 }}>
                        Verify
                      </Button>
                    </>
                  )}
                </View>
              );
            }}
          </Formik>
        </KeyboardAvoidingView>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    padding: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  countdownText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
    textAlign: 'center',
  },
});
