import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Category from '../../components/client/Category'; 
import SearchBar from '../../components/client/SearchBar';
import Doctors from '../../components/client/Doctors';
import Clinics from '../../components/client/Clinics';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchSubmit = useCallback(() => {
    router.push({
      pathname: '/search',
      params: { query: searchQuery },
    });
  }, [searchQuery, router]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmit={handleSearchSubmit}
        />
        <Category />
        <Doctors searchQuery={searchQuery} />
        <Clinics searchQuery={searchQuery} />
       
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
