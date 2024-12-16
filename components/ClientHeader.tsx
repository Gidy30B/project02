import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ClientHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Client Header</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: '#6200EE',
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ClientHeader;
