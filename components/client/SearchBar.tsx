import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const SearchBar: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const handlePress = () => {
    if (query.trim() !== '') {
      router.push(`/search?query=${query}`);
    } else {
      // Handle case when no query is entered (optional)
      console.log('Please enter a search query.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handlePress}
      />
      <TouchableOpacity onPress={handlePress} style={styles.iconContainer}>
        <Ionicons name="search" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    borderRadius: 25,
    backgroundColor: '#fff',
    color: '#333',
  },
  iconContainer: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 25,
  },
});

export default SearchBar;
