import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ClientHeader from '../../components/client/ClientHeader'; // Adjust the path if needed

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        // Custom header with dynamic title
        header: () => <ClientHeader title={getTitle(route.name)} />,
        
        // Dynamically changing tab icons
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'home':
              return <MaterialIcons name="home" size={size} color={color} />;
            case 'appointments':
              return <MaterialIcons name="event" size={size} color={color} />;
            case 'health':
              return <MaterialIcons name="health-and-safety" size={size} color={color} />;
            case 'settings':
              return <MaterialIcons name="settings" size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' }, // Style for tab labels
        tabBarStyle: {
          backgroundColor: '#f0f0f0', // Custom background color for tab bar
          paddingVertical: 10,
        },
        headerMode: 'float', // Ensure the header scrolls smoothly with the content
      })}
    >
      <Tabs.Screen name="home" options={{ tabBarLabel: 'Home' }} />
      <Tabs.Screen name="appointments" options={{ tabBarLabel: 'Appointments' }} />
      <Tabs.Screen name="health" options={{ tabBarLabel: 'Health' }} />
      <Tabs.Screen name="settings" options={{ tabBarLabel: 'Settings' }} />
    </Tabs>
  );
}

// Function to dynamically set the title for each screen
function getTitle(routeName: string): string {
  switch (routeName) {
    case 'home':
      return 'Welcome Home';
    case 'appointments':
      return 'Your Appointments';
    case 'health':
      return 'Health Insights';
    case 'settings':
      return 'Settings';
    default:
      return 'Client';
  }
}
