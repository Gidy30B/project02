// hooks/useDoctors.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/store/configureStore';
import { fetchDoctors } from '../app/store/doctorSlice';

const useDoctors = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rawDoctorList = useSelector((state: RootState) => state.doctors.doctorList);

  useEffect(() => {
    console.log('Raw doctor data:', rawDoctorList);
  }, [rawDoctorList]);

  const doctorList = rawDoctorList.map(doctor => ({
    id: doctor._id,
    name: `${doctor.firstName} ${doctor.lastName}`,
    specialty: doctor.specialty || 'General',
    experience: doctor.clinic?.experiences || [],
    profileImage: doctor.profileImage,
    clinicAddress: doctor.clinic?.address,
    insuranceCompanies: doctor.clinic?.insuranceCompanies || [],
  }));

  const loading = useSelector((state: RootState) => state.doctors.loading);
  const error = useSelector((state: RootState) => state.doctors.error);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  return { doctorList, loading, error };
};

export default useDoctors;
