
// Import your global CSS file
import "../global.css";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from './store/configureStore';
import { AuthProvider } from '../context/AuthContext'; // Import AuthContext for user state
import { useColorScheme } from '@/hooks/useColorScheme';
import { PaperProvider } from 'react-native-paper';
import queryClient from "./(services)/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PaperProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="auth/register" options={{ title: 'Register', headerShown: false }} />
              <Stack.Screen name="client" options={{ title: 'Welcome', headerShown: false}} />
              <Stack.Screen name="hospital/book-appointment/[id]" options={{ title: '', headerShown: false }} />
              <Stack.Screen name="client/tabs" /> 
              <Stack.Screen name="doctors" options={{ title: 'Doctors Overview' }} /> 
              <Stack.Screen name="tasks" options={{ title: 'Tasks', headerShown: true }} />
              <Stack.Screen name="income" options={{ title: 'Wallet', headerShown: true }} />
              <Stack.Screen name="consultations" options={{ title: 'Patients', headerShown: true }} />
              <Stack.Screen name="doctor/[doctorId]" options={{ title: 'Doctor Profile' }} />
              <Stack.Screen name="doctor" />
              <Stack.Screen name="addclinic" />
              <Stack.Screen name="pharmacist/tabs" />
              <Stack.Screen name="addpharmacy" />
            </Stack>
          </PaperProvider>
        </AuthProvider>
      </QueryClientProvider>
      <StatusBar style="auto" />
    </Provider>
  );
}
