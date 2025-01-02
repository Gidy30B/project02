import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
     
      </View>

      {/* Tab Navigator */}
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case 'index':
                iconName = 'account';
                break;
              case 'PersonalDetails':
                iconName = 'account-details';
                break;
              case 'PracticeInfo':
                iconName = 'hospital-box';
                break;
              case 'Verification':
                iconName = 'check-decagram';
                break;
              default:
                iconName = 'help-circle-outline';
                break;
            }
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#f8f9fa',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 60,
          },
          tabBarShowLabel: false, // Remove labels
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: '#6c757d',
          headerShown: false,
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="PersonalDetails" />
        <Tabs.Screen name="PracticeInfo" />
        <Tabs.Screen name="Verification" />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 6,
  },
});
