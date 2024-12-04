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
  const clinicImages = clinic ? clinic.images : [];

  console.log('Received clinicImages:', clinicImages); // Add this line to log the received images

  const loading = useSelector(selectClinicLoading);
  const error = useSelector(selectClinicError);

  const [showFullDesc, setShowFullDesc] = useState(false);
  const [aboutFocused, setAboutFocused] = useState(false);

  useEffect(() => {
    if (clinicId) {
      dispatch(fetchClinicById(clinicId));
    }
  }, [clinicId, dispatch]);

  console.log('Clinic Images:', clinicImages); // Log clinic images

  console.log('Clinic Data:', clinic);
  console.log('Loading:', loading);
  console.log('Error:', error);

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

  console.log('Doctors Data:', doctorsData);

  const truncatedDesc = showFullDesc 
    ? clinic.bio || "No bio available."
    : (clinic.bio ? clinic.bio.split(" ").slice(0, 18).join(" ") : 'No bio available.');

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/client/home')}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.profileName}>{clinic.name}</Text>
      </TouchableOpacity>

      {clinicImages.length > 0 && (
        <Image 
          source={{ uri: clinicImages[0] }} 
          style={styles.clinicImage} 
        />
      )}

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

      <TouchableOpacity
        style={[styles.aboutSection, aboutFocused && styles.aboutSectionFocused]}
        onPress={() => setAboutFocused(!aboutFocused)}
      >
        <ClinicSubHeading subHeadingTitle={clinic.name} />
        <Text style={styles.description}>{truncatedDesc}</Text>
        <TouchableOpacity onPress={() => setShowFullDesc(prev => !prev)}>
          <Text style={styles.seeMoreText}>
            {showFullDesc ? 'Hide' : 'See More'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

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
          nestedScrollEnabled={true} // Add this prop
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
          nestedScrollEnabled={true} // Add this prop
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
            renderItem={({ item }) => {
              console.log('Doctor Item:', item); // Log the doctor item
              return (
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
              );
            }}
            keyExtractor={(item) => item._id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            nestedScrollEnabled={true} // Add this prop
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.ligh_gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.SECONDARY,
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
    backgroundColor: Colors.SECONDARY,
  },
  errorText: {
    fontSize: 18,
    color: Colors.SECONDARY,
  },
  backButton: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: Colors.ligh_gray,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  clinicImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  aboutSection: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  aboutSectionFocused: {
    borderColor: Colors.SECONDARY,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  seeMoreText: {
    color: Colors.primary,
    fontSize: 14,
    marginBottom: 20,
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
