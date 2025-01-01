import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfessionalDetailsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Professional Details</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Medical Degree(s)</Text>
        <TextInput
          placeholder="Degree name, University, Year"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Specialization</Text>
        <TextInput
          placeholder="e.g., Cardiology, Neurology"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Certifications</Text>
        <TextInput
          placeholder="e.g., ACLS, ATLS"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>License Number</Text>
        <TextInput
          placeholder="Enter license or registration ID"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Issuing Medical Board</Text>
        <TextInput
          placeholder="e.g., Medical Council of XYZ"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          placeholder="e.g., 10"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
});
