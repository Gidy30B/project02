import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from './store/configureStore';
import { AuthProvider, useAuthContext } from '../context/AuthContext'; // Import AuthContext for user state
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AuthNavigator />
        </AuthProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </Provider>
  );
}

function AuthNavigator() {
  const { user } = useAuthContext();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {user.userType === 'client' && (
            <>
             <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '', headerShown: false }} />
              <Stack.Screen name="client/tabs" />  {/* Existing client tabs screen */}
              <Stack.Screen name="doctors" options={{ title: 'Doctors Overview' }} />  {/* Link to the doctors overview */}
              <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Profile' }} />
            </>
          )}

          {user.userType === 'professional' && (
            <>
              {user.professional.profession === 'doctor' && (
                <Stack.Screen name={user.professional.attachedToClinic ? 'doctor' : 'addclinic'} />
              )}
              {user.professional.profession === 'pharmacist' && (
                <Stack.Screen name={user.professional.attachedToPharmacy ? 'pharmacist/tabs' : 'addpharmacy'} />
              )}
            </>
          )}

          {user.userType === 'student' && <Stack.Screen name="student/tabs" />}
          {user.userType === 'rider' && <Stack.Screen name="rider/tabs" />}
        </>
      ) : (
        <>
          <Stack.Screen name="register" options={{ title: 'Register', headerShown: true }} />
          <Stack.Screen name="client" options={{ title: 'Welcome', headerShown: true }} />
        </>
      )}
    </Stack>
  );
}
