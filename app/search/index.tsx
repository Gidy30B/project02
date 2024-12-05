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
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { selectClinics } from '../store/clinicSlice';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';

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

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setSelectedSpecialty('');
    setSelectedInsurance('');

    const locationFilteredClinics = clinics.filter((clinic) =>
      clinic.address?.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredClinics(locationFilteredClinics);

    const locationFilteredProfessionals = locationFilteredClinics.flatMap(
      (clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
    );
    setFilteredProfessionals(locationFilteredProfessionals);
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);

    const specialtyFilteredProfessionals = filteredProfessionals.filter(
      (professional) =>
        professional.specialty?.toLowerCase().includes(specialty.toLowerCase())
    );
    setFilteredProfessionals(specialtyFilteredProfessionals);
  };

  const handleInsuranceChange = (insurance: string) => {
    setSelectedInsurance(insurance);

    const insuranceFilteredProfessionals = filteredClinics
      .filter((clinic) =>
        clinic.insuranceCompanies?.some((provider) =>
          provider?.toLowerCase().includes(insurance.toLowerCase())
        )
      )
      .flatMap((clinic) =>
        clinic.professionals?.map((professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      );
    setFilteredProfessionals(insuranceFilteredProfessionals);
  };

  const resetFilters = () => {
    setSelectedLocation('');
    setSelectedSpecialty('');
    setSelectedInsurance('');
    setFilteredClinics(clinics);
    setFilteredProfessionals(clinics.flatMap((clinic) =>
      clinic.professionals?.map((professional) => ({
        ...professional,
        clinicName: clinic.name,
        clinicAddress: clinic.address,
        clinicInsurances: clinic.insuranceCompanies,
      })) || []
    ));
  };

  const uniqueLocations = [
    ...new Set(clinics.map((clinic) => clinic.address?.split(',')[0] || '')),
  ];
  const uniqueSpecialties = [
    ...new Set(
      clinics.flatMap((clinic) =>
        clinic.professionals?.map((professional) => professional.specialty) || []
      )
    ),
  ];
  const uniqueInsurances = [
    ...new Set(
      clinics.flatMap((clinic) => clinic.insuranceCompanies || [])
    ),
  ];

  if (loading) return (
    <View>
      <Text>Loading...</Text>
    </View>
  );

  if (error) return (
    <View>
      <Text>{error}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Search"
          style={styles.searchBox}
          editable={false}
        />
        <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {selectedLocation === '' && (
        <Picker
          selectedValue={selectedLocation}
          onValueChange={handleLocationChange}
          style={styles.picker}
        >
          <Picker.Item label="Select Location" value="" />
          {uniqueLocations.map((location, index) => (
            <Picker.Item key={index} label={location} value={location} />
          ))}
        </Picker>
      )}

      {selectedLocation && selectedSpecialty === '' && (
        <Picker
          selectedValue={selectedSpecialty}
          onValueChange={handleSpecialtyChange}
          style={styles.picker}
        >
          <Picker.Item label="Select Specialty" value="" />
          {uniqueSpecialties.map((specialty, index) => (
            <Picker.Item key={index} label={specialty} value={specialty} />
          ))}
        </Picker>
      )}

      {selectedSpecialty && (
        <Picker
          selectedValue={selectedInsurance}
          onValueChange={handleInsuranceChange}
          style={styles.picker}
        >
          <Picker.Item label="Select Insurance" value="" />
          {uniqueInsurances.map((insurance, index) => (
            <Picker.Item key={index} label={insurance} value={insurance} />
          ))}
        </Picker>
      )}

      <FlatList
        data={filteredProfessionals}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/doctors/${item._id}`)} style={styles.cardContainer}>
            <Image
              source={{
                uri: item.profileImage || 'https://via.placeholder.com/100',
              }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {item.firstName} {item.lastName}
              </Text>
              <Text>{item.profession}</Text>
              <Text>{item.clinicName}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/doctors/${item._id}`)} style={styles.button}>
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    height: 40,
  },
  resetButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginLeft: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    marginVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardContainer: {
    flexDirection: 'row',
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    margin: 10,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  goBackButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  goBackButtonText: {
    color: '#333',
  },
});

export default ClinicSearch;
