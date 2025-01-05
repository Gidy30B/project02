import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';

const ProfessionalDetailsScreen = ({ navigation }) => {
  const userId = useSelector((state) => state.auth.userId);
  const router = useRouter();

  const [formData, setFormData] = useState({
    medicalDegree: '',
    institution: '',
    year: '',
    specialization: '',
    licenseNumber: '',
    issuingMedicalBoard: '',
    yearsOfExperience: '',
    specializedTreatment: '',
  });

  const [consultationFee, setConsultationFee] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSave = async () => {
    // Validate fields
    const missingFields = Object.keys(formData).filter(
      (key) => formData[key].trim() === ''
    );

    if (missingFields.length > 0) {
      Alert.alert('Error', `Missing fields: ${missingFields.join(', ')}`);
      return;
    }

    const payload = {
      ...formData,
      consultationFee,
      medicalDegrees: [
        {
          degree: formData.medicalDegree,
          institution: formData.institution,
          year: formData.year,
        },
      ],
    };

    try {
      const response = await axios.put(
        `https://medplus-health.onrender.com/api/professionals/update-profile/${userId}`,
        payload
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');
        router.push('PracticeInfoScreen', {
          missingFields: response.data.missingFields,
        });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Professional Details</Text>

      {/* Medical Degree */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Medical Degree</Text>
        <Picker
          selectedValue={formData.medicalDegree}
          style={styles.input}
          onValueChange={(value) => handleInputChange('medicalDegree', value)}
        >
          <Picker.Item label="Select Medical Degree" value="" />
          <Picker.Item label="Bachelor of Medicine and Bachelor of Surgery (MBCHB)" value="MBCHB" />
          <Picker.Item label="Bachelors of Dental Surgery" value="BDS" />
        </Picker>
      </View>

      {/* Additional fields... */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Institution</Text>
        <TextInput
          placeholder="Enter institution"
          style={styles.input}
          value={formData.institution}
          onChangeText={(text) => handleInputChange('institution', text)}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Year</Text>
        <TextInput
          placeholder="Enter year"
          keyboardType="numeric"
          style={styles.input}
          value={formData.year}
          onChangeText={(text) => handleInputChange('year', text)}
        />
      </View>
      
      {/* Specialization */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Specialization</Text>
        <Picker
          selectedValue={formData.specialization}
          style={styles.input}
          onValueChange={(value) => handleInputChange('specialization', value)}
        >
          <Picker.Item label="Select Specialization" value="" />
          <Picker.Item label="Critical Care Medicine" value="Critical Care Medicine" />
          <Picker.Item label="Neuro-anaesthesia" value="Neuro-anaesthesia" />
          <Picker.Item label="Cardiac Anaesthesia" value="Cardiac Anaesthesia" />
          <Picker.Item label="Paediatric Anaesthesia" value="Paediatric Anaesthesia" />
          <Picker.Item label="Critical Care Anaesthesia" value="Critical Care Anaesthesia" />
          <Picker.Item label="Regional Anaesthesia" value="Regional Anaesthesia" />
          <Picker.Item label="Pain Management" value="Pain Management" />
          <Picker.Item label="Cardiothoracic Anaesthesia" value="Cardiothoracic Anaesthesia" />
          <Picker.Item label="Ambulatory Anaesthesia" value="Ambulatory Anaesthesia" />
          <Picker.Item label="Obstetric Anaesthesia" value="Obstetric Anaesthesia" />
          <Picker.Item label="Transplant Anaesthesia" value="Transplant Anaesthesia" />
        </Picker>
        <TextInput
          placeholder="Or type your specialization"
          style={styles.input}
          value={formData.specialization}
          onChangeText={(text) => handleInputChange('specialization', text)}
        />
      </View>
      
      {/* License Number */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>License Number</Text>
        <TextInput
          placeholder="Enter license number"
          style={styles.input}
          value={formData.licenseNumber}
          onChangeText={(text) => handleInputChange('licenseNumber', text)}
        />
      </View>
      
      {/* Issuing Medical Board */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Issuing Medical Board</Text>
        <TextInput
          placeholder="Enter issuing medical board"
          style={styles.input}
          value={formData.issuingMedicalBoard}
          onChangeText={(text) => handleInputChange('issuingMedicalBoard', text)}
        />
      </View>
      
      {/* Years of Experience */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          placeholder="Enter years of experience"
          keyboardType="numeric"
          style={styles.input}
          value={formData.yearsOfExperience}
          onChangeText={(text) => handleInputChange('yearsOfExperience', text)}
        />
      </View>
      
      {/* Specialized Treatment */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Specialized Treatment</Text>
        <Picker
          selectedValue={formData.specializedTreatment}
          style={styles.input}
          onValueChange={(value) => handleInputChange('specializedTreatment', value)}
        >
          <Picker.Item label="Select Specialized Treatment" value="" />
          <Picker.Item label="Cardiac Diagnostic and Therapeutic Procedures" value="Cardiac Diagnostic and Therapeutic Procedures" />
          <Picker.Item label="Latest Cancer Treatment Options" value="Latest Cancer Treatment Options" />
          <Picker.Item label="Orthopedics" value="Orthopedics" />
          <Picker.Item label="Infertility Treatments" value="Infertility Treatments" />
          <Picker.Item label="Cosmetic Surgery" value="Cosmetic Surgery" />
          <Picker.Item label="Dental Treatment" value="Dental Treatment" />
          <Picker.Item label="General Surgery" value="General Surgery" />
          <Picker.Item label="Organ Transplants" value="Organ Transplants" />
          <Picker.Item label="Rehabilitation and Geriatric" value="Rehabilitation and Geriatric" />
          <Picker.Item label="Bariatric Surgery" value="Bariatric Surgery" />
          <Picker.Item label="Pediatrics" value="Pediatrics" />
          <Picker.Item label="Second Opinion Consults" value="Second Opinion Consults" />
        </Picker>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Consultation Fee</Text>
        <TextInput
          placeholder="Enter consultation fee"
          keyboardType="numeric"
          style={styles.input}
          value={consultationFee}
          onChangeText={setConsultationFee}
        />
      </View>

      {/* Save Button */}
      <Button title="Save" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
});

export default ProfessionalDetailsScreen;
