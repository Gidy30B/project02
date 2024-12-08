import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import Colors from '../Shared/Colors';

import * as SplashScreen from 'expo-splash-screen';
SplashScreen.preventAutoHideAsync();

import {
  Poppins_600SemiBold,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_700Bold,
  Poppins_500Medium,
  useFonts,
} from "@expo-google-fonts/poppins";

export default function SubHeading({ subHeadingTitle }) {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_300Light,
    Poppins_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);



  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subHeadingTitle}</Text>
      <TouchableOpacity>
        <Text style={styles.viewAll}>view all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
  viewAll: {
    fontFamily: 'Poppins_500Medium',
    color: Colors.PRIMARY,
  },
};