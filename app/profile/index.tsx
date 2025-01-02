import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView, // Import ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux'; // Import useSelector
import { loadUserFromStorage } from '../(redux)/authSlice'; // Adjust the import path as needed

const DoctorRegistrationForm = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const userId = useSelector((state) => state.auth.userId); // Get userId from Redux
  const token = useSelector((state) => state.auth.token); // Get token from Redux
  console.log('User ID:', userId); // Log the userId
  console.log('Token:', token); // Log the token

  useEffect(() => {
    const loadProfileImage = async () => {
      const storedImage = await AsyncStorage.getItem('profileImage');
      if (storedImage) {
        setProfileImage(storedImage);
      }
    };

    loadProfileImage();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // Use ImagePicker.MediaType
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    setUploading(true);
    try {
      console.log('Starting image upload...');
      const { uri } = await FileSystem.getInfoAsync(profileImage);
      console.log('Image URI:', uri);
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = (e) => reject(new TypeError('Network request failed'));
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const filename = profileImage.substring(profileImage.lastIndexOf('/') + 1);
      console.log('Filename:', filename);
      const ref = firebase.storage().ref().child(filename);
      await ref.put(blob);
      blob.close();

      const url = await ref.getDownloadURL();
      console.log('Image uploaded successfully. URL:', url);
      setProfileImage(url);
      await AsyncStorage.setItem('profileImage', url);

      Alert.alert('Profile image uploaded successfully');
      return url; // Return the URL after successful upload
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Image upload failed');
      return null; // Return null if upload fails
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!profileImage || !fullName || !email || !phoneNumber) {
      Alert.alert('Please fill out all fields and upload a profile image.');
      return;
    }

    try {
      console.log('Starting profile update...');
      const profileImageUrl = await uploadImage();
      if (!profileImageUrl) {
        throw new Error('Failed to upload image');
      }

      console.log('Profile image URL:', profileImageUrl);
      const response = await fetch('https://medplus-health.onrender.com/api/users/updateDoctorProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({ userId, fullName, email, phoneNumber, profileImage: profileImageUrl }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      console.log('Profile updated successfully');
      Alert.alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Failed to update profile');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.profileContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editButton} onPress={pickImage}>
              <Text style={styles.editButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name (e.g., Dr. John Doe)"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={uploading}
            >
              <Text style={styles.submitButtonText}>
                {uploading ? 'Uploading...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default DoctorRegistrationForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', alignItems: 'center', paddingTop: 20 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  profileContainer: { alignItems: 'center', marginBottom: 30 },
  profileImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#6200ee' },
  placeholderImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#aaa', fontSize: 16 },
  editButton: { marginTop: 10, backgroundColor: '#6200ee', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 20 },
  editButtonText: { color: '#fff', fontSize: 14 },
  formContainer: { width: '90%', backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 2 },
  input: { height: 50, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 20, fontSize: 16, paddingHorizontal: 10 },
  submitButton: { backgroundColor: '#6200ee', paddingVertical: 15, borderRadius: 5, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16 },
});
