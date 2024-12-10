import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClinics, filterClinics, selectClinics, setSelectedClinic } from '../../app/store/clinicSlice';

export const useSearchLogic = () => {
  const dispatch = useDispatch();
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const clinics = useSelector(selectClinics);

  useEffect(() => {
    try {
      if (clinics.length > 0) {
        const allProfessionals = clinics.flatMap((clinic: Clinic) =>
          clinic.professionals?.map((professional: Professional) => ({
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
      clinics.flatMap((clinic: Clinic) =>
        clinic.professionals?.map((professional: Professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      )
    );
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    const locationFilteredClinics = clinics.filter((clinic: Clinic) =>
      clinic.address?.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredClinics(locationFilteredClinics);
    setFilteredProfessionals(
      locationFilteredClinics.flatMap((clinic: Clinic) =>
        clinic.professionals?.map((professional: Professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      )
    );
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    const specialtyFilteredProfessionals = filteredProfessionals.filter(
      (professional: Professional) =>
        professional.specialty?.toLowerCase().includes(specialty.toLowerCase())
    );
    setFilteredProfessionals(specialtyFilteredProfessionals);
  };

  const handleInsuranceChange = (insurance: string) => {
    setSelectedInsurance(insurance);
    const insuranceFilteredClinics = filteredClinics.filter((clinic: Clinic) =>
      clinic.insuranceCompanies?.some((provider: string) =>
        provider?.toLowerCase().includes(insurance.toLowerCase())
      )
    );
    setFilteredProfessionals(
      insuranceFilteredClinics.flatMap((clinic: Clinic) =>
        clinic.professionals?.map((professional: Professional) => ({
          ...professional,
          clinicName: clinic.name,
          clinicAddress: clinic.address,
          clinicInsurances: clinic.insuranceCompanies,
        })) || []
      )
    );
  };

  return {
    filteredClinics,
    filteredProfessionals,
    selectedLocation,
    selectedSpecialty,
    selectedInsurance,
    loading,
    error,
    resetFilters,
    handleLocationChange,
    handleSpecialtyChange,
    handleInsuranceChange,
  };
};