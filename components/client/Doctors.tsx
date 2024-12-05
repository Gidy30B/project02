import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import useDoctors from '../../hooks/useDoctors'; // Import the custom hook
import SubHeading from '../client/SubHeading';
import Colors from '../../components/Shared/Colors';

interface DoctorsProps {
  searchQuery: string;
  selectedCategory: string;
  onViewAll: (category: string) => void;
  excludeDoctorId?: string;
}

const Doctors: React.FC<DoctorsProps> = ({ searchQuery, selectedCategory, onViewAll, excludeDoctorId }) => {
  const router = useRouter();
  const { doctorList, loading, error } = useDoctors(); // Use the hook to get the list of doctors

  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);

  const filterDoctors = useCallback(() => {
    if (!Array.isArray(doctorList)) {
      console.error('Doctor list is not an array:', doctorList);
      return;
    }
  
    let doctors = doctorList;
  
    if (excludeDoctorId) {
      doctors = doctors.filter((doctor) => doctor.id !== excludeDoctorId);
    }
  
    if (searchQuery) {
      doctors = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.insuranceCompanies.some((company) =>
          company.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  
    if (selectedCategory) {
      doctors = doctors.filter((doctor) => doctor.specialty === selectedCategory);
    }
  
    setFilteredDoctors(doctors);
  }, [searchQuery, selectedCategory, doctorList, excludeDoctorId]);

  // Effect to filter doctors based on searchQuery and selectedCategory
  useEffect(() => {
    filterDoctors();
  }, [filterDoctors]);

  const handleConsult = (doctorId: string) => {
    router.push(`/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return <Text>Error loading doctors: {error}</Text>;
  }

  return (
    <View style={{ marginTop: 10 }}>
      <SubHeading subHeadingTitle="Discover Doctors Near You" onViewAll={() => onViewAll('Doctors')} />
      <FlatList
        data={filteredDoctors}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.doctorItem}>
            {/* Doctor Image */}
            <Image
              source={{
                uri:
                  item.profileImage ||
                  'https://res.cloudinary.com/dws2bgxg4/image/upload/v1726073012/nurse_portrait_hospital_2d1bc0a5fc.jpg',
              }}
              style={styles.doctorImage}
            />
            {/* Doctor Name */}
            <View style={styles.nameCategoryContainer}>
              <Text style={styles.doctorName}>
                {item.name}
              </Text>
              {/* Doctor Category */}
              <Text style={styles.doctorName}>{item.specialty}</Text>
            </View>
            {/* Doctor Location */}
            <Text>{item.clinicAddress || 'Location not specified'}</Text>
            {/* Consult Button */}
            <TouchableOpacity
              style={[styles.button, styles.consultButton]}
              onPress={() => handleConsult(item.id)}
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  doctorItem: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    padding: 10,
    width: 240,
  },
  doctorImage: {
    width: '100%',
    height: 150,
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
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  consultButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    alignSelf: 'center',
  },
  buttonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Doctors;
