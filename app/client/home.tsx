import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Category from '../../components/client/Category'; // Import the Category component
import SearchBar from '../../components/client/SearchBar';
import Doctors from '@/components/client/Doctors';
import Clinics from '@/components/client/Clinics';
const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <SearchBar />
      <Category /> {/* Render Category component as the first component */}
      <Doctors />
      <Clinics />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
});
