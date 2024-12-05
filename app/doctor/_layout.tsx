import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ClientHeader from '../../components/client/ClientHeader'; // Adjust the path if needed

export default function DoctorLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        // Use the same ClientHeader for DoctorLayout
        header: () => <ClientHeader title={getTitle(route.name)} />,
        
        // Set icons for each tab based on route name
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'dashboard':
              return <MaterialIcons name="dashboard" size={size} color={color} />;
            case 'appointments':
              return <MaterialIcons name="event" size={size} color={color} />;
            case 'schedule':
              return <MaterialIcons name="schedule" size={size} color={color} />;
            case 'settings':
              return <MaterialIcons name="settings" size={size} color={color} />;
            case 'transaction': // Add this case for the new tab
              return <MaterialIcons name="payment" size={size} color={color} />;
            default:
              return null;
          }
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' }, // Customize the label style
        tabBarStyle: {
          backgroundColor: '#f0f0f0', // Background color for tab bar
          paddingVertical: 10,
        },
      })}
    >
      {/* Ensure all children are of type Tabs.Screen */}
      <Tabs.Screen name="dashboard" options={{ tabBarLabel: 'Dashboard' }} />
      <Tabs.Screen name="appointments" options={{ tabBarLabel: 'Appointments' }} />
      <Tabs.Screen name="schedule" options={{ tabBarLabel: 'Schedule' }} />
      <Tabs.Screen name="settings" options={{ tabBarLabel: 'Settings' }} />
      <Tabs.Screen name="transaction" options={{ tabBarLabel: 'Transaction' }} /> {/* Add this line for the new tab */}
    </Tabs>
  );
}

// Function to dynamically set the title for each screen
function getTitle(routeName: string): string {
  switch (routeName) {
    case 'dashboard':
      return 'Doctor Dashboard';
    case 'appointments':
      return 'Your Appointments';
    case 'schedule':
      return 'Manage Schedule';
    case 'settings':
      return 'Settings';
    case 'transaction': // Add this case for the new tab
      return 'Transaction';
    default:
      return 'Doctor';
  }
}
