import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '../../../components/Shared/Colors';
import { fetchClinicById, selectClinicDetails, selectClinicLoading, selectClinicError } from '../../store/clinicSlice';

const BookAppointment = () => {
  const { id: clinicId } = useLocalSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const clinic = useSelector(selectClinicDetails);
  const loading = useSelector(selectClinicLoading);
  const error = useSelector(selectClinicError);

  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (clinicId) {
      dispatch(fetchClinicById(clinicId));
    }
  }, [clinicId, dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load clinic data.</Text>
      </View>
    );
  }

  const handleConsult = (doctorId) => {
    router.push(`/doctors/${doctorId}`);
  };

  const truncatedDesc = showFullDesc
    ? clinic.bio || 'No bio available.'
    : (clinic.bio ? clinic.bio.split(' ').slice(0, 18).join(' ') : 'No bio available.');

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/client/home')}>
          <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{clinic?.name || 'Clinic'}</Text>
      </View>

      {/* Clinic Info */}
      <View style={styles.clinicInfo}>
        <Image source={{ uri: clinic?.images[0] }} style={styles.clinicImage} />
        <View style={styles.clinicDetails}>
          <Text style={styles.clinicName}>{clinic?.name}</Text>
          <Text style={styles.clinicAddress}>{clinic?.address}</Text>
          <Text style={styles.clinicContact}>{clinic?.contactInfo}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{truncatedDesc}</Text>
        <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
          <Text style={styles.showMoreText}>{showFullDesc ? 'Show Less' : 'Show More'}</Text>
        </TouchableOpacity>
      </View>

      {/* Doctors List */}
      <Text style={styles.sectionTitle}>Doctors</Text>
      <FlatList
        data={clinic?.doctors}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={styles.doctorCard}>
            <Image source={{ uri: item.profileImage }} style={styles.doctorImage} />
            <Text style={styles.doctorName}>{item.name}</Text>
            <Text style={styles.doctorSpecialties}>{item.specialties?.join(', ')}</Text>
            <Text style={styles.consultationFee}>Fee: {item.consultationFee} KES</Text>
            <TouchableOpacity onPress={() => handleConsult(item._id)} style={styles.consultButton}>
              <Text style={styles.consultButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.doctorsList}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  clinicInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  clinicImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  clinicDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#555',
  },
  clinicContact: {
    fontSize: 14,
    color: Colors.PRIMARY,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  doctorCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialties: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  consultationFee: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginBottom: 8,
  },
  consultButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  consultButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  doctorsList: {
    paddingBottom: 16,
  },
});

export default BookAppointment;
