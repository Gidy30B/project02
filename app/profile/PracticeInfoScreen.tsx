import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface Experience {
  institution: string;
  year: string;
  role: string;
}

export default function PracticeInfoScreen(): JSX.Element {
  const [experiences, setExperiences] = useState<Experience[]>([
    { institution: '', year: '', role: '' },
  ]);

  const handleExperienceChange = (
    index: number,
    field: keyof Experience,
    value: string
  ): void => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index][field] = value;
    setExperiences(updatedExperiences);
  };

  const addExperience = (): void => {
    setExperiences([...experiences, { institution: '', year: '', role: '' }]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Practice Information</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Workplace</Text>
          <TextInput
            placeholder="Hospital/Clinic name and location"
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Past Work Experience</Text>
        {experiences.map((experience, index) => (
          <View key={index} style={styles.experienceContainer}>
            <TextInput
              placeholder="Institution"
              style={styles.input}
              value={experience.institution}
              onChangeText={(value) =>
                handleExperienceChange(index, 'institution', value)
              }
            />
            <TextInput
              placeholder="Year"
              style={styles.input}
              value={experience.year}
              onChangeText={(value) => handleExperienceChange(index, 'year', value)}
            />
            <TextInput
              placeholder="Role"
              style={styles.input}
              value={experience.role}
              onChangeText={(value) => handleExperienceChange(index, 'role', value)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={addExperience}>
          <Text style={styles.addButtonText}>+ Add Another Experience</Text>
        </TouchableOpacity>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Professional Affiliations</Text>
          <TextInput
            placeholder="Memberships in medical associations"
            style={styles.input}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 8,
  },
  experienceContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
  },
});
