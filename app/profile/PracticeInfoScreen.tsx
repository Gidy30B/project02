import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  View,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import useInsurance from '../../hooks/useInsurance';
import { useSelector } from 'react-redux';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '../../firebase/config';

const PracticeInformation = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [practiceName, setPracticeName] = useState('');
  const [practiceLocation, setPracticeLocation] = useState('');
  const [workingDays, setWorkingDays] = useState([
    { day: 'Mon', active: false },
    { day: 'Tue', active: false },
    { day: 'Wed', active: false },
    { day: 'Thu', active: false },
    { day: 'Fri', active: false },
    { day: 'Sat', active: false },
    { day: 'Sun', active: false },
  ]);
  const [workingHours, setWorkingHours] = useState({ startTime: '', endTime: '' });
  const [experience, setExperience] = useState([]);
  const [institution, setInstitution] = useState('');
  const [year, setYear] = useState('');
  const [roles, setRoles] = useState('');
  const [notableAchievement, setNotableAchievement] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedInsuranceProviders, setSelectedInsuranceProviders] = useState([]);
  const { insuranceProviders } = useInsurance();
  const router = useRouter();
  const userId = useSelector((state) => state.auth.userId); // Get userId from Redux
  console.log('User ID:', userId);


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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
  
      if (!result.cancelled) {
        setProfileImage(result.assets[0].uri);
      }
    };
    
  const toggleDay = (dayIndex) => {
    const updatedDays = [...workingDays];
    updatedDays[dayIndex].active = !updatedDays[dayIndex].active;
    setWorkingDays(updatedDays);
  };

  const toggleInsuranceProvider = (providerId) => {
    setSelectedInsuranceProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  const addExperience = () => {
    if (!institution || !year || !roles || !notableAchievement) {
      Alert.alert('Please fill out all fields for the experience.');
      return;
    }

    setExperience((prev) => [
      ...prev,
      { institution, year, roles, notableAchievement },
    ]);

    setInstitution('');
    setYear('');
    setRoles('');
    setNotableAchievement('');
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
      return url;
    } catch (error) {
      console.error('Image upload failed:', error);
      Alert.alert('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!practiceName || !practiceLocation || !profileImage) {
      Alert.alert('Please fill out all mandatory fields.');
      return;
    }
  
    const selectedDays = workingDays.filter((day) => day.active).map((day) => day.day);
  
    if (selectedDays.length === 0 || !workingHours.startTime || !workingHours.endTime) {
      Alert.alert('Please select working days and specify working hours.');
      return;
    }
  
    if (selectedInsuranceProviders.length === 0) {
      Alert.alert('Please select at least one insurance provider.');
      return;
    }
  
    try {
      console.log('Starting practice information update...');
      const profileImageUrl = await uploadImage();
      if (!profileImageUrl) {
        throw new Error('Failed to upload image');
      }
  
      console.log('Profile image URL:', profileImageUrl);
      const payload = {
        userId,
        practiceName,
        practiceLocation,
        profileImage: profileImageUrl,
        workingDays: selectedDays,
        workingHours,
        experience,
        insuranceProviders: selectedInsuranceProviders,
      };
      console.log('Payload:', payload);
  
      const response = await fetch('https://medplus-health.onrender.com/api/professionals/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      console.log('Response status:', response.status);
      const responseBody = await response.json();
      console.log('Response body:', responseBody);
  
      if (!response.ok) throw new Error('Failed to update practice information');
  
      console.log('Practice information updated successfully');
      Alert.alert('Practice information updated successfully.');
      router.push('/profile/Verification');
    } catch (error) {
      console.error('Failed to update practice information:', error);
      Alert.alert('Failed to update practice information');
    } finally {
      setUploading(false);
    }
  };

  const renderInsuranceProvider = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.insuranceProviderCard,
        selectedInsuranceProviders.includes(item._id) && styles.activeInsuranceProviderCard,
      ]}
      onPress={() => toggleInsuranceProvider(item._id)}
    >
      <Image source={{ uri: item.icon }} style={styles.insuranceProviderIcon} />
      <Text style={styles.insuranceProviderCardText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
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

        <TextInput
          style={styles.input}
          placeholder="Clinic Name (Required)"
          value={practiceName}
          onChangeText={setPracticeName}
        />
        <TextInput
          style={styles.input}
          placeholder="Location (Required)"
          value={practiceLocation}
          onChangeText={setPracticeLocation}
        />

        {/* Insurance Providers Section */}
        <Text style={styles.sectionHeader}>Supported Insurance Providers</Text>
        <View style={styles.insuranceProvidersContainer}>
          <FlatList
            data={insuranceProviders}
            renderItem={renderInsuranceProvider}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Working Days Section */}
        <Text style={styles.sectionHeader}>Working Days</Text>
        <View style={styles.dayCardsContainer}>
          {workingDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayCard, day.active && styles.activeDayCard]}
              onPress={() => toggleDay(index)}
            >
              <Text style={styles.dayCardText}>{day.day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Working Hours Section */}
        <Text style={styles.sectionHeader}>Working Hours</Text>
        <View style={styles.hoursContainer}>
          <TextInput
            style={styles.input}
            placeholder="Start Time (e.g., 9:00 AM)"
            value={workingHours.startTime}
            onChangeText={(value) => setWorkingHours({ ...workingHours, startTime: value })}
          />
          <TextInput
            style={styles.input}
            placeholder="End Time (e.g., 5:00 PM)"
            value={workingHours.endTime}
            onChangeText={(value) => setWorkingHours({ ...workingHours, endTime: value })}
          />
        </View>

        {/* Experience Section */}
        <Text style={styles.sectionHeader}>Experience (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Institution"
          value={institution}
          onChangeText={setInstitution}
        />
        <TextInput
          style={styles.input}
          placeholder="Year"
          value={year}
          onChangeText={setYear}
        />
        <TextInput
          style={styles.input}
          placeholder="Roles"
          value={roles}
          onChangeText={setRoles}
        />
        <TextInput
          style={styles.input}
          placeholder="Notable Achievement"
          value={notableAchievement}
          onChangeText={setNotableAchievement}
        />
        <TouchableOpacity style={styles.addButton} onPress={addExperience}>
          <Text style={styles.addButtonText}>Add Experience</Text>
        </TouchableOpacity>

        {experience.length > 0 && (
          <View style={styles.experienceList}>
            {experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.experienceText}>
                  {exp.institution} ({exp.year}) - {exp.roles}
                </Text>
                <Text style={styles.experienceText}>
                  Achievement: {exp.notableAchievement}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
  },
  editButton: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dayCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayCard: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  activeDayCard: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  dayCardText: {
    color: '#333',
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  experienceList: {
    marginBottom: 16,
  },
  experienceItem: {
    marginBottom: 8,
  },
  experienceText: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  insuranceProvidersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  insuranceProviderCard: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
    width: 100,
    alignItems: 'center',
  },
  activeInsuranceProviderCard: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  insuranceProviderCardText: {
    color: '#333',
  },
  insuranceProviderIcon: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
});

export default PracticeInformation;
