import React, { useState, useEffect, createRef, RefObject } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../(services)/api/api";
import axios from "axios";
import Loader from "../../components/Loader";
import LoginWithGoogle from '../../components/LoginWithGoogle';

interface RegisterValues {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(6, "Too Short!").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  firstName: Yup.string().required("Required"),
  lastName: Yup.string().required("Required"),
});

export default function Register() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const emailInputRef: RefObject<TextInput> = createRef();
  const passwordInputRef: RefObject<TextInput> = createRef();
  const firstNameInputRef: RefObject<TextInput> = createRef();
  const lastNameInputRef: RefObject<TextInput> = createRef();
  const confirmPasswordInputRef: RefObject<TextInput> = createRef();

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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Loader loading={loading} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: '50%',
              height: 100,
              resizeMode: 'contain',
              margin: 30,
            }}
          />
        </View>
        <KeyboardAvoidingView enabled>
          <Formik
            initialValues={{
              email: "",
              password: "",
              confirmPassword: "",
              firstName: "",
              lastName: "",
            }}
            validationSchema={RegisterSchema}
            onSubmit={(values: RegisterValues) => {
              const data = {
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
              };
              setLoading(true);
              mutation
                .mutateAsync(data)
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
                      <View style={styles.SectionStyle}>
                        <TextInput
                          style={styles.inputStyle}
                          placeholder="First Name"
                          placeholderTextColor="#666"
                          onChangeText={handleChange("firstName")}
                          onBlur={handleBlur("firstName")}
                          value={values.firstName}
                          ref={firstNameInputRef}
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            lastNameInputRef.current && lastNameInputRef.current.focus()
                          }
                          blurOnSubmit={false}
                        />
                      </View>
                      {errors.firstName && touched.firstName ? (
                        <Text style={styles.errorTextStyle}>{errors.firstName}</Text>
                      ) : null}
                      <View style={styles.SectionStyle}>
                        <TextInput
                          style={styles.inputStyle}
                          placeholder="Last Name"
                          placeholderTextColor="#666"
                          onChangeText={handleChange("lastName")}
                          onBlur={handleBlur("lastName")}
                          value={values.lastName}
                          ref={lastNameInputRef}
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            emailInputRef.current && emailInputRef.current.focus()
                          }
                          blurOnSubmit={false}
                        />
                      </View>
                      {errors.lastName && touched.lastName ? (
                        <Text style={styles.errorTextStyle}>{errors.lastName}</Text>
                      ) : null}
                      <View style={styles.SectionStyle}>
                        <TextInput
                          style={styles.inputStyle}
                          placeholder="Email"
                          placeholderTextColor="#666"
                          onChangeText={handleChange("email")}
                          onBlur={handleBlur("email")}
                          value={values.email}
                          keyboardType="email-address"
                          ref={emailInputRef}
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            passwordInputRef.current && passwordInputRef.current.focus()
                          }
                          blurOnSubmit={false}
                        />
                      </View>
                      {errors.email && touched.email ? (
                        <Text style={styles.errorTextStyle}>{errors.email}</Text>
                      ) : null}
                      <View style={styles.SectionStyle}>
                        <TextInput
                          style={styles.inputStyle}
                          placeholder="Password"
                          placeholderTextColor="#666"
                          onChangeText={handleChange("password")}
                          onBlur={handleBlur("password")}
                          value={values.password}
                          secureTextEntry
                          ref={passwordInputRef}
                          returnKeyType="next"
                          onSubmitEditing={() =>
                            confirmPasswordInputRef.current && confirmPasswordInputRef.current.focus()
                          }
                          blurOnSubmit={false}
                        />
                      </View>
                      {errors.password && touched.password ? (
                        <Text style={styles.errorTextStyle}>{errors.password}</Text>
                      ) : null}
                      <View style={styles.SectionStyle}>
                        <TextInput
                          style={styles.inputStyle}
                          placeholder="Confirm Password"
                          placeholderTextColor="#666"
                          onChangeText={handleChange("confirmPassword")}
                          onBlur={handleBlur("confirmPassword")}
                          value={values.confirmPassword}
                          secureTextEntry
                          ref={confirmPasswordInputRef}
                          returnKeyType="done"
                          onSubmitEditing={Keyboard.dismiss}
                          blurOnSubmit={false}
                        />
                      </View>
                      {errors.confirmPassword && touched.confirmPassword ? (
                        <Text style={styles.errorTextStyle}>{errors.confirmPassword}</Text>
                      ) : null}
                      <TouchableOpacity
                        style={styles.buttonStyle}
                        onPress={handleSubmit}
                        disabled={mutation.isLoading}
                      >
                        {mutation.isLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.buttonTextStyle}>Register</Text>
                        )}
                      </TouchableOpacity>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 30 }}>
                        <LoginWithGoogle onLoginSuccess={() => router.push('/(client)')} />
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          marginBottom: 30,
                        }}>
                        <Text>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push("/auth/login")}>
                          <Text style={{ color: '#AD40AF', fontWeight: '700' }}> Login</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.subHeading}>Enter the verification code sent to your email</Text>
                      <TextInput
                        style={styles.inputStyle}
                        placeholder="Verification Code"
                        placeholderTextColor="#666"
                        onChangeText={setVerificationCode}
                        value={verificationCode}
                        keyboardType="numeric"
                      />
                      <Text style={styles.countdownText}>
                        {countdown > 0 ? `Time remaining: ${countdown}s` : 'Code expired!'}
                      </Text>
                      <TouchableOpacity style={styles.buttonStyle} onPress={handleVerificationPress}>
                        <Text style={styles.buttonTextStyle}>Verify</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            }}
          </Formik>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  SectionStyle: {
    flexDirection: 'row',
    height: 40,
    marginTop: 20,
    marginLeft: 35,
    marginRight: 35,
    margin: 10,
  },
  buttonStyle: {
    backgroundColor: '#AD40AF',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#AD40AF',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 20,
    marginBottom: 20,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  inputStyle: {
    flex: 1,
    color: '#333',
    paddingLeft: 15,
    paddingRight: 15,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#dadae8',
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontSize: 14,
  },
  successTextStyle: {
    color: '#333',
    textAlign: 'center',
    fontSize: 18,
    padding: 30,
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
