import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  SafeAreaView,
  View,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Text,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import Colors from '@/components/Shared/Colors';
import { selectClinics } from '../store/clinicSlice';

const ClinicSearch = () => {
  const router = useRouter();
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clinics = useSelector(selectClinics);

  useEffect(() => {
    try {
      if (clinics.length > 0) {
        const allProfessionals = clinics.flatMap((clinic) =>
          clinic.professionals?.map((professional) => ({
            ...professional,
            clinicName: clinic.name,
            clinicAddress: clinic.address,
            clinicInsurances: clinic.insuranceCompanies,
          })) || []
        );
        setFilteredProfessionals(allProfessionals);
        setFilteredClinics(clinics);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [clinics]);

  const resetFilters = () => {
    setSelectedLocation('');
    setSelectedSpecialty('');
    setSelectedInsurance('');
    setFilteredClinics(clinics);
    setFilteredProfessionals(
      clinics.flatMap((clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      )
    );
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    const locationFilteredClinics = clinics.filter((clinic) =>
      clinic.address?.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredClinics(locationFilteredClinics);
    setFilteredProfessionals(
      locationFilteredClinics.flatMap((clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      )
    );
  };

  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialty(specialty);
    const specialtyFilteredProfessionals = filteredProfessionals.filter(
      (professional) =>
        professional.specialty?.toLowerCase().includes(specialty.toLowerCase())
    );
    setFilteredProfessionals(specialtyFilteredProfessionals);
  };

  const handleInsuranceChange = (insurance) => {
    setSelectedInsurance(insurance);
    const insuranceFilteredClinics = filteredClinics.filter((clinic) =>
      clinic.insuranceCompanies?.some((provider) =>
        provider?.toLowerCase().includes(insurance.toLowerCase())
      )
    );
    setFilteredProfessionals(
      insuranceFilteredClinics.flatMap((clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      )
    );
  };

  const uniqueLocations = [...new Set(clinics.map((clinic) => clinic.address?.split(',')[0] || ''))];
  const uniqueSpecialties = [
    ...new Set(
      clinics.flatMap((clinic) => clinic.professionals?.map((professional) => professional.specialty) || [])
    ),
  ];
  const uniqueInsurances = [
    ...new Set(clinics.flatMap((clinic) => clinic.insuranceCompanies || [])),
  ];

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TextInput
          placeholder="Search clinics or professionals"
          style={styles.searchBox}
          editable={false}
        />
        <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <Picker selectedValue={selectedLocation} onValueChange={handleLocationChange} style={styles.picker}>
          <Picker.Item label="Select Location" value="" />
          {uniqueLocations.map((location, index) => (
            <Picker.Item key={index} label={location} value={location} />
          ))}
        </Picker>
        {selectedLocation && (
          <Picker selectedValue={selectedSpecialty} onValueChange={handleSpecialtyChange} style={styles.picker}>
            <Picker.Item label="Select Specialty" value="" />
            {uniqueSpecialties.map((specialty, index) => (
              <Picker.Item key={index} label={specialty} value={specialty} />
            ))}
          </Picker>
        )}
        {selectedSpecialty && (
          <Picker selectedValue={selectedInsurance} onValueChange={handleInsuranceChange} style={styles.picker}>
            <Picker.Item label="Select Insurance" value="" />
            {uniqueInsurances.map((insurance, index) => (
              <Picker.Item key={index} label={insurance} value={insurance} />
            ))}
          </Picker>
        )}
        <View>
          <Text style={styles.sectionTitle}>Professionals</Text>
          <FlatList
            data={filteredProfessionals}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/doctor/${item._id}`)}
                style={styles.cardContainer}
              >
                <Image
                  source={{ uri: item.profileImage || 'https://via.placeholder.com/100' }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.firstName} {item.lastName}</Text>
                  <Text>{item.specialty}</Text>
                  <Text>{item.clinicName}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
          />
          <Text style={styles.sectionTitle}>Clinics</Text>
          <FlatList
            data={filteredClinics}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/clinics/${item._id}`)}
                style={styles.cardContainer}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text>{item.address}</Text>
                  <Text>{item.insuranceCompanies.join(', ')}</Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dce775',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    height: 40,
  },
  resetButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    marginLeft: 8,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
  },
  picker: {
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 8,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingLeft: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClinicSearch;
