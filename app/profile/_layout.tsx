import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>
          Complete your comprehensive professional profile.
        </Text>
      </View>

      {/* Tab Navigator */}
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            switch (route.name) {
              case 'index':
                iconName = 'account-circle';
                return <MaterialIcons name={iconName} size={size} color={color} />;
              case 'PracticeInfo':
                iconName = 'hospital';
                return <FontAwesome6 name={iconName} size={size} color={color} />;
              case 'Verification':
                iconName = 'verified-user';
                return <MaterialIcons name={iconName} size={size} color={color} />;
              default:
                iconName = 'help-outline';
                return <MaterialIcons name={iconName} size={size} color={color} />;
            }
          },
          tabBarStyle: {
            backgroundColor: '#fff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderColor: '#e3e3e3',
          },
          tabBarShowLabel: false, // Remove labels
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: '#929292',
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
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e3e3e3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d1d1d',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#929292',
    marginTop: 4,
  },
});
