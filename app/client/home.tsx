import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import Category from '../../components/client/Category'; 
import SearchBar from '../../components/client/SearchBar';
import Doctors from '../../components/client/Doctors';
import Clinics from '../../components/client/Clinics';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleSearchSubmit = useCallback(() => {
    router.push({
      pathname: '/search',
      params: { query: searchQuery },
    });
  }, [searchQuery, router]);

  return (
    <Animated.ScrollView
      contentContainerStyle={styles.scrollContainer}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
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
    </Animated.ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#dce775',
    padding: 20,
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
