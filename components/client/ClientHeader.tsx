// components/ClientHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../../app/store/userSlice'; // Adjust the import path
import { useRouter } from 'expo-router'; // Use the router from expo-router
import { Entypo } from '@expo/vector-icons'; // Using Expo's Entypo icons for logout
import AntDesign from '@expo/vector-icons/AntDesign';
const ClientHeader: React.FC<{ title: string }> = ({ title }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { profileImage, name } = useSelector(selectUser); // Get profile image and user info from Redux

  // Logout handler
  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action to reset user state
    router.push('/login'); // Navigate to login or home screen after logout
  };

  return (
    <View style={styles.container}>
      {/* Profile Image on the left */}
      <View style={styles.leftSection}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImageFallback}>
            <Text style={styles.profileInitial}>{name?.[0]}</Text>
          </View>
        )}
      </View>

      {/* Centered Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Logout Icon on the right */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
      <AntDesign name="logout" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50', // Match your theme color
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Ensures title is centered
    textAlign: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  profileImageFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
});

export default ClientHeader;
