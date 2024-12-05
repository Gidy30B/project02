import React from "react";
import { SplashScreen, Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../context/theme.context";
import {
  Poppins_600SemiBold,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_700Bold,
  Poppins_500Medium,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Provider } from 'react-redux';
import { store } from './store/configureStore';
import { AuthProvider } from '../context/AuthContext';

import { Provider as PaperProvider } from 'react-native-paper';

export default function _layout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Poppins_600SemiBold,
    Poppins_300Light,
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
  });

  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <PaperProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(routes)/onboarding/index" />
              <Stack.Screen name="register" options={{ title: 'Register', headerShown: true }} />
            </Stack>
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}