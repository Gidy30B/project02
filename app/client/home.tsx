import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Category from '../../components/client/Category'; 
import SearchBar from '../../components/client/SearchBar';
import Doctors from '../../components/client/Doctors';
import Clinics from '../../components/client/Clinics';
const HomeScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <SearchBar />
        <Category />
        <Doctors />
        <Clinics />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
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
