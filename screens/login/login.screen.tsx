import React, { useState, useContext, createRef } from 'react'
import { TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../../components/login/Background'
import Logo from '../../components/login/Logo'
import Header from '../../components/login/Header'
import Button from '../../components/login/Button'
import TextInput from '../../components/login/TextInput'
import BackButton from '../../components/login/BackButton'
import { theme } from '../../core/theme'
import { emailValidator } from '../../helpers/emailValidator'
import { passwordValidator } from '../../helpers/passwordValidator'
import { useRouter } from 'expo-router'
import GlobalApi from '../../Services/GlobalApi'
import { useDispatch } from 'react-redux'
import { login } from '../../app/store/userSlice'
import { AuthContext } from '../../context/AuthContext'
import Icon from 'react-native-vector-icons/Ionicons'

export default function LoginScreen() {
  const [email, setEmail] = useState({ value: '', error: '' })
  const [password, setPassword] = useState({ value: '', error: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const passwordInputRef = createRef<TextInput>()
  const router = useRouter()
  const dispatch = useDispatch()
  const { login: authLogin } = useContext(AuthContext)

  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value)
    const passwordError = passwordValidator(password.value)
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError })
      setPassword({ ...password, error: passwordError })
      return
    }

    setIsLoggingIn(true)
    try {
      const response = await GlobalApi.loginUser(email.value, password.value)
      if (!response || !response.data) {
        throw new Error('Invalid response from server')
      }
      setErrorMessage(null)

      const { token, userId, firstName, lastName, email: userEmail, userType, doctorId, professional, profileImage, riderId } = response.data

      if (!firstName || !lastName) {
        console.error('First name or last name is missing:', { firstName, lastName })
      }

      dispatch(login({
        name: `${firstName} ${lastName}`,
        email: userEmail,
        userId,
        userType,
        professional,
        profileImage,
        riderId,
      }))

      authLogin({
        name: `${firstName} ${lastName}`,
        email: userEmail,
        userId,
        userType,
        professional,
        profileImage,
        riderId,
      })

      setTimeout(() => {
        let route = ''
        switch (userType) {
          case 'professional':
            if (professional && professional.profession === 'doctor') {
              route = professional.attachedToClinic ? '/doctor' : '/addclinic'
            } else if (professional && professional.profession === 'pharmacist' && !professional.attachedToPharmacy) {
              route = '/addpharmacy'
            } else if (professional && professional.profession === 'pharmacist') {
              route = '/pharmacist/tabs'
            } else {
              route = '/professional'
            }
            break
          case 'client':
            route = '/client/home'
            break
          case 'student':
            route = '/student/tabs'
            break
          case 'rider':
            route = '/rider/tabs'
            break
          default:
            route = '/student/tabs'
        }
        router.push(route)
      }, 0)
    } catch (error) {
      console.error('Error during login:', error)
      setErrorMessage('Invalid email or password. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <Background>
      <Logo />
      <Header>Welcome back.</Header>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          label="Password"
          returnKeyType="done"
          value={password.value}
          onChangeText={(text) => setPassword({ value: text, error: '' })}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
          <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#333" />
        </TouchableOpacity>
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <View style={styles.forgotPassword}>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed} disabled={isLoggingIn}>
        {isLoggingIn ? <ActivityIndicator size="small" color="#fff" /> : 'Login'}
      </Button>
      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </Background>
  )
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 35, // Adjusted to align with the password placeholder
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
})