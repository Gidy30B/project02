import React, { useState, useContext, createRef } from 'react'
import { TouchableOpacity, StyleSheet, View, ActivityIndicator } from 'react-native'
import { Text } from 'react-native-paper'
import Background from '../../components/login/Background'
import Logo from '../../components/login/Logo'
import Header from '../../components/login/Header'
import { emailValidator } from '../../helpers/emailValidator'
import { passwordValidator } from '../../helpers/passwordValidator'
import { useRouter } from 'expo-router'
import GlobalApi from '../../Services/GlobalApi'
import { useDispatch } from 'react-redux'
import { login } from '../../app/store/userSlice'
import { AuthContext } from '../../context/AuthContext'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '@/components/Shared/Colors'
import InputField from '@/components/InputField'
import CustomButton from '../../components/CustomButton';

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
    <View style={styles.container}>
      <Logo style={styles.logo} />
      <Header style={styles.title}>Welcome back.</Header>
      <View style={styles.inputContainer}>
        <InputField
          label="Email"
          icon={<MaterialIcons name="alternate-email" size={20} color="#333" />}
          inputType="text"
          keyboardType="email-address"
          fieldButtonLabel=""
          fieldButtonFunction={() => {}}
          onChangeText={(text) => setEmail({ value: text, error: '' })}
          onBlur={() => {}}
          value={email.value}
        />
      </View>
      <View style={styles.inputContainer}>
        <InputField
          label="Password"
          icon={<Ionicons name="lock-closed-outline" size={20} color="#333" />}
          inputType="password"
          keyboardType="default"
          fieldButtonLabel=""
          fieldButtonFunction={() => setShowPassword(!showPassword)}
          onChangeText={(text) => setPassword({ value: text, error: '' })}
          onBlur={() => {}}
          value={password.value}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#333" />
        </TouchableOpacity>
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity onPress={() => {}}>
        <Text style={styles.forgotPassword}>Forgot your password?</Text>
      </TouchableOpacity>
      <CustomButton
        label="Login"
        onPress={onLoginPressed}
        isPending={isLoggingIn}
        isError={!!errorMessage}
        isSuccess={false}
      />
      <View style={styles.row}>
        <Text style={styles.signUp}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a3de83',
    paddingHorizontal: 20,
  },
  logo: {
    height: 200,
    width: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    fontWeight: 'bold',
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  signUp: {
    color: Colors.PRIMARY,
  },
  signUpLink: {
    color: '#1E90FF',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
})