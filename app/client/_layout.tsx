import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import ClientHeader from '../../components/client/ClientHeader'; // Adjust the path if needed
import { useSelector } from 'react-redux';
import { Badge } from 'react-native-elements';
import { View } from 'react-native'; // Import View from react-native

export default function ClientLayout() {
  const notifications = useSelector((state) => state.appointments.notifications); // Ensure correct path to notifications

  return (
    <Tabs
      screenOptions={({ route }) => ({
        // Custom header with dynamic title
        header: () => <ClientHeader title={getTitle(route.name)} />,
        
        // Dynamically changing tab icons
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'home':
              iconName = 'home';
              break;
            case 'appointments':
              iconName = 'event';
              break;
            case 'health':
              iconName = 'health-and-safety';
              break;
            case 'settings':
              iconName = 'settings';
              break;
            default:
              return null;
          }

          return (
            <View>
              <MaterialIcons name={iconName} size={size} color={color} />
              {route.name === 'appointments' && notifications.some(n => n.type === 'newAppointment') && (
                <Badge
                  status="error"
                  containerStyle={{ position: 'absolute', top: -4, right: -4 }}
                />
              )}
            </View>
          );
        },
        tabBarLabelStyle: { fontSize: 12 }, // Style for tab labels
        tabBarStyle: {
          backgroundColor: '#a3de83', // Custom background color for tab bar
          borderTopColor: 'transparent',
          height: 60,
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
