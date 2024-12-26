// in a rnfes import and render the ModalScreen

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text } from 'react-native';
import ModalScreen from '@/screens/ModalScreen';


export default function Modal() {
  return (
    <ModalScreen />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 16,
    color: 'grey',
  },
});