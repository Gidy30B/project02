import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ClientHeader from '@/components/ClientHeader';


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
      <Tabs.Screen name="schedule" options={{ tabBarLabel: 'Schedule' }} />
      <Tabs.Screen name="transaction" options={{ tabBarLabel: 'Transaction' }} /> {/* Move this line up */}
      <Tabs.Screen name="settings" options={{ tabBarLabel: 'Settings' }} /> {/* Move this line down */}
    </Tabs>
  );
}

// Function to dynamically set the title for each screen
function getTitle(routeName: string): string {
  switch (routeName) {
    case 'dashboard':
      return 'Doctor Dashboard';
    case 'schedule':
      return 'Manage Schedule';
    case 'transaction': // Move this case up
      return 'Transaction';
    case 'settings': // Move this case down
      return 'Settings';
    default:
      return 'Doctor';
  }
}
