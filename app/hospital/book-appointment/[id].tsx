import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ActionButton from '../../../components/common/ActionButton';
import Colors from '../../../components/Shared/Colors';
import { fetchClinicById, selectClinicDetails, selectClinicLoading, selectClinicError } from '../../store/clinicSlice';
import ClinicSubHeading from '../../../components/clinics/ClinicSubHeading';

const BookAppointment = () => {
  const { id: clinicId, professional: professionalParam } = useLocalSearchParams();
  const selectedProfessional = professionalParam ? JSON.parse(professionalParam) : null;

  const scrollViewRef = useRef<ScrollView>(null);
  const bookingSectionRef = useRef<View>(null);
  const router = useRouter();

  const dispatch = useDispatch();
  const clinic = useSelector(selectClinicDetails);
  const clinicImages = clinic ? clinic.clinicImages : [];
  const clinicImageUri = clinicImages.length > 0 ? clinicImages[0] : 'https://via.placeholder.com/80';

  const loading = useSelector(selectClinicLoading);
  const error = useSelector(selectClinicError);

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [aboutFocused, setAboutFocused] = useState(false);

  useEffect(() => {
    if (clinicId) {
      dispatch(fetchClinicById(clinicId));
    }
  }, [clinicId, dispatch]);

  useEffect(() => {
    console.log('Clinic Data:', clinic);
  }, [clinic]);

  const handleBookPress = () => {
    if (bookingSectionRef.current && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: bookingSectionRef.current.offsetTop,
        animated: true,
      });
    }
  };

  const handleConsult = (doctorId: string) => {
    router.push(`/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
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

  if (!clinic) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No clinic found.</Text>
      </View>
    );
  }

  const { professionals = [], doctors = [] } = clinic;

  const doctorsData = [
    ...professionals.map(professional => ({
      _id: professional._id,
      name: `${professional.firstName} ${professional.lastName}`,
      specialties: [professional.category || professional.profession],
      profileImage: professional.profileImage,
      consultationFee: professional.consultationFee || 0,
    })),
    ...doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      specialties: doctor.specialties || [],
      profileImage: doctor.profileImage,
      consultationFee: doctor.consultationFee || 0,
    }))
  ].filter(doctor => !selectedProfessional || doctor._id !== selectedProfessional._id);

  const truncatedDesc = showFullDesc 
    ? clinic.bio || "No bio available."
    : (clinic.bio ? clinic.bio.split(" ").slice(0, 18).join(" ") : 'No bio available.');

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
        <Image source={{ uri: clinicImageUri }} style={styles.clinicImage} />
        <View style={styles.clinicDetails}>
          <Text style={styles.clinicName}>{clinic?.name}</Text>
          <Text style={styles.clinicAddress}>{clinic?.address}</Text>
          <Text style={styles.clinicContact}>{clinic?.contactInfo}</Text>
        </View>
      </View>

      <ActionButton location={clinic.address} contact={clinic.contactInfo} />

      {selectedProfessional && selectedProfessional.user && (
        <View style={styles.selectedProfessionalContainer}>
          <Image 
            source={{ uri: selectedProfessional.user.profileImage }} 
            style={styles.selectedProfessionalImage} 
          />
          <View style={styles.selectedProfessionalInfo}>
            <Text style={styles.selectedProfessionalName}>
              {selectedProfessional.firstName} {selectedProfessional.lastName}
            </Text>
            <Text style={styles.selectedProfessionalTitle}>
              {selectedProfessional.title}
            </Text>
            <Text style={styles.selectedProfessionalSpecialty}>
              Specialty: {selectedProfessional.profession}
            </Text>
            <Text style={styles.selectedProfessionalFee}>
              Consultation Fee: {selectedProfessional.consultationFee} KES
            </Text>
          </View>
        </View>
      )}

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{truncatedDesc}</Text>
        <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
          <Text style={styles.showMoreText}>{showFullDesc ? 'Show Less' : 'Show More'}</Text>
        </TouchableOpacity>
      </View>

      <ClinicSubHeading subHeadingTitle={'Specialties'} />
      <View>
        <FlatList
          data={clinic.specialties.split(',')}
          horizontal={true}
          renderItem={({ item }) => (
            <View style={styles.specialtyCard}>
              <Text style={styles.specialty}>{item}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtyList}
        />
      </View>

      <ClinicSubHeading subHeadingTitle={'Insurance Companies'} />
      <View>
        <FlatList
          data={clinic.insuranceCompanies}
          horizontal={true}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.insuranceCard}>
              <Text style={styles.insurance}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.insuranceList}
        />
      </View>

      <ClinicSubHeading subHeadingTitle={'Doctors'} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      ) : (
        <View>
          <FlatList
            data={doctorsData}
            horizontal={true}
            renderItem={({ item }) => (
              <View style={styles.doctorItem}>
                <Image 
                  source={{ 
                    uri: item.profileImage ? item.profileImage : 'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg' 
                  }} 
                  style={styles.doctorImage} 
                />
                <View style={styles.nameCategoryContainer}>
                  <Text style={styles.doctorName}>{item.name}</Text> 
                  <Text style={styles.doctorSpecialty}>{item.specialties.join(', ')}</Text> 
                </View>
                <Text style={styles.consultationFee}>Consultation Fee: {item.consultationFee} KES</Text>
                <TouchableOpacity style={[styles.button, styles.consultButton]} onPress={() => handleConsult(item._id)}>
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item._id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: Colors.PRIMARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.PRIMARY,
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
  selectedProfessionalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedProfessionalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  selectedProfessionalInfo: {
    flex: 1,
  },
  selectedProfessionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  selectedProfessionalTitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  selectedProfessionalSpecialty: {
    fontSize: 16,
    color: Colors.gray,
  },
  selectedProfessionalFee: {
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  insuranceCard: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 20,
    marginRight: 10,
  },
  insurance: {
    fontSize: 14,
    color: Colors.primary,
  },
  insuranceList: {
    marginBottom: 20,
  },
  specialtyCard: {
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 20,
    marginRight: 10,
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary,
  },
  specialtyList: {
    marginBottom: 20,
  },
  doctorItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    width: 200,
  },
  doctorImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  nameCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  doctorName: {
    fontFamily: 'SourceSans3-Bold',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
  },
  doctorSpecialty: {
    color: Colors.PRIMARY,
    fontSize: 12,
    textAlign: 'right',
    flex: 1,
  },
  consultationFee: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 5,
    textAlign: 'center',
  },
  consultButton: {
    backgroundColor: Colors.LIGHT_GRAY,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingVertical: 10,
  },
});

export default BookAppointment;
