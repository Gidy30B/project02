import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import PrescriptionTemplate from '@/components/PrescriptionTemplate';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/components/Shared/Colors';


import { RootState } from './store/configureStore';

const PrescriptionScreen = () => {
  const navigation = useNavigation();
  const prescription = useSelector((state: RootState) => state.prescription);



  if (!prescription) {
    return (
      <View style={styles.errorContainer}>
        <Text>No prescription data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <PrescriptionTemplate prescription={prescription} />
   
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ligh_gray,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    borderRadius: 16, 
    padding: 4,
  },
});

export default PrescriptionScreen;
