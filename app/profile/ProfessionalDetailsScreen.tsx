import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';

const medicalCourses = ["MBBS", "MD", "DO", "BDS"];
const specializations = ["Cardiology", "Neurology", "Orthopedics", "Pediatrics"];
const certifications = ["ACLS", "ATLS", "BLS", "PALS"];

export default function ProfessionalDetailsScreen() {
  const userId = useSelector((state) => state.auth.userId);
  const [consultationFee, setConsultationFee] = useState('');
  const [formData, setFormData] = useState({
    medicalDegree: '',
    institution: '',
    year: '',
    specialization: '',
    certifications: '',
    licenseNumber: '',
    medicalBoard: '',
    experience: '',
  });
  const router = useRouter();

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const allFields = { ...formData, consultationFee };

    try {
      const response = await axios.put(
        `https://medplus-health.onrender.com/api/professionals/update-profile/${userId}`,
        allFields
      );
      if (response.status === 200) {
        router.push('/profile/PracticeInfoScreen');
      }
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Professional Details</Text>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Medical Degree(s)</Text>
          <Picker
            style={styles.input}
            selectedValue={formData.medicalDegree}
            onValueChange={(value) => handleInputChange('medicalDegree', value)}
          >
            {medicalCourses.map((course) => (
              <Picker.Item key={course} label={course} value={course} />
            ))}
          </Picker>
          <TextInput
            placeholder="Institution"
            style={styles.input}
            value={formData.institution}
            onChangeText={(value) => handleInputChange('institution', value)}
          />
          <TextInput
            placeholder="Year"
            keyboardType="numeric"
            style={styles.input}
            value={formData.year}
            onChangeText={(value) => handleInputChange('year', value)}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Specialization</Text>
          <Picker
            style={styles.input}
            selectedValue={formData.specialization}
            onValueChange={(value) => handleInputChange('specialization', value)}
          >
            {specializations.map((spec) => (
              <Picker.Item key={spec} label={spec} value={spec} />
            ))}
          </Picker>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Certifications</Text>
          <Picker
            style={styles.input}
            selectedValue={formData.certifications}
            onValueChange={(value) => handleInputChange('certifications', value)}
          >
            {certifications.map((cert) => (
              <Picker.Item key={cert} label={cert} value={cert} />
            ))}
          </Picker>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>License Number</Text>
          <TextInput
            placeholder="Enter license or registration ID"
            style={styles.input}
            value={formData.licenseNumber}
            onChangeText={(value) => handleInputChange('licenseNumber', value)}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <TextInput
            placeholder="e.g., 10"
            keyboardType="numeric"
            style={styles.input}
            value={formData.experience}
            onChangeText={(value) => handleInputChange('experience', value)}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Consultation Fee</Text>
          <TextInput
            placeholder="Enter fee in USD"
            keyboardType="numeric"
            style={styles.input}
            value={consultationFee}
            onChangeText={(value) => setConsultationFee(value)}
          />
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
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
    marginBottom: 24,
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
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
