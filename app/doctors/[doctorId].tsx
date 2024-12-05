import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors, setSelectedDoctor, clearSelectedDoctor, selectSelectedDoctor } from '../../app/store/doctorSlice';
import { useRouter } from 'expo-router';
import { RootState } from '../../app/store/configureStore';
import Colors from '../../components/Shared/Colors';

import BookingSection from '../../components/BookingSection';
import HorizontalLine from '../../components/common/HorizontalLine';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from 'react-native-elements';


const DoctorProfile: React.FC = () => {
  const router = useRouter();
  const route = useRoute();
  const doctorId = route.params?.doctorId;

  const dispatch = useDispatch();
  const doctor = useSelector(selectSelectedDoctor);
  const loading = useSelector((state: RootState) => state.doctors.loading);
  const error = useSelector((state: RootState) => state.doctors.error);
  const doctors = useSelector((state: RootState) => state.doctors.doctorList);
  const otherDoctors = doctors.filter((doc) => doc._id !== doctorId);

  useEffect(() => {
    if (doctorId) {
      dispatch(setSelectedDoctor(doctorId));
    }
    return () => {
      dispatch(clearSelectedDoctor());
    };
  }, [dispatch, doctorId]);

  useEffect(() => {
    console.log('Selected Doctor:', doctor);
  }, [doctor]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Doctor information not found.</Text>
      </View>
    );
  }

  const profileImageUri =
    doctor.profileImage ||
    'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg';

  const insuranceProviders = doctor.clinicId?.insuranceCompanies || [];
  console.log(insuranceProviders);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        data={[]}
        ListHeaderComponent={
          <>
            <View style={styles.profileContainer}>
              <Avatar
                source={{ uri: profileImageUri }}
                containerStyle={styles.avatar}
                imageProps={{ style: { borderRadius: 50 } }}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.doctorName}>{`${doctor.firstName} ${doctor.lastName}`}</Text>
                <Text style={styles.categoryName}>{doctor.specialty || 'General'}</Text>
                <Text style={styles.consultationFee}>{`Consultation Fee: ${doctor.consultationFee || 'N/A'}`}</Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <View style={styles.infoCard}>
                <Ionicons name="person" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{doctor.user.yearsOfExperience || 'N/A'} Years of Experience</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="people" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{doctor.user.numberOfPatients || 'N/A'} Patients</Text>
              </View>
            </View>
            <BookingSection
              doctorId={doctor._id}
              consultationFee={doctor.consultationFee || 'N/A'}
              insurances={insuranceProviders}
            />
            <HorizontalLine />
            <View style={styles.otherDoctorsContainer}>
              <Text style={styles.sectionTitle}>Other Doctors</Text>
              <FlatList
                data={otherDoctors}
                horizontal={true}
                renderItem={({ item }) => (
                  <View style={styles.doctorItem}>
                    <Avatar
                      source={{ uri: item.profileImage || 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' }}
                      containerStyle={styles.avatar}
                      imageProps={{ style: { borderRadius: 50 } }}
                    />
                    <View style={styles.profileInfo}>
                      <Text style={styles.doctorName}>{`${item.firstName} ${item.lastName}`}</Text>
                      <Text style={styles.categoryName}>{item.specialty || 'General'}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewButton} onPress={() => router.push(`/doctors/${item._id}`)}>
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </View>
                )}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
              />
            </View>
          </>
        }
        renderItem={null}
        keyExtractor={() => 'dummy'}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light_gray,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.light_gray,
    borderRadius: 8,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  categoryName: {
    fontSize: 16,
    color: Colors.gray,
    marginVertical: 4,
  },
  consultationFee: {
    fontSize: 16,
    color: Colors.gray,
    marginVertical: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 15,
  },
  doctorItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.light_gray,
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  flatListContent: {
    paddingVertical: 10,
  },
  otherDoctorsContainer: {
    marginTop: 20,
  },
  viewButton: {
    backgroundColor: Colors.LIGHT_GRAY,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  viewButtonText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DoctorProfile;
