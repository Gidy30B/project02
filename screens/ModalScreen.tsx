import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text } from 'react-native';
import CustomButton from '../components/CustomButton';
import { View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

export default function ModalScreen() {
  const route = useRoute();
  const { id } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event ID: {id}</Text>
      <Text style={styles.time}>
        <AntDesign name="calendar" size={24} color="black" />
        {" | "}
        {new Date().toString()}
      </Text>
      <CustomButton 
        label="Confirm" 
        onPress={() => {}} 
        isPending={false} 
        isError={false} 
        isSuccess={false} 
      />
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 16,
    color: 'grey',
  },
});