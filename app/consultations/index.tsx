import { StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router' // Updated import
import useAppointments from '@/hooks/useAppointments' // ...existing code...

const index = () => {
  const router = useRouter() // Added router hook
  const { appointments } = useAppointments() // ...existing code...

  const renderAppointment = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: 'https://example.com/avatar.png' }} // ...existing code...
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.patientName}</Text>
        <Text style={styles.email}>{item.patientId.email}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/doctor')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        renderItem={renderAppointment}
      />
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007BFF',
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
})