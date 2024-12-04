import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet, Picker } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, PayStackRef } from 'react-native-paystack-webview';
import axios from 'axios';
import Colors from './Shared/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, updateUserProfile } from '../app/store/userSlice';
import useSchedule from '../hooks/useSchedule';

const BookingSection: React.FC<{ doctorId: string; consultationFee: number; insurances?: string[]; selectedInsurance?: string }> = ({
  doctorId,
  consultationFee,
  insurances = [], 
  selectedInsurance: initialSelectedInsurance = '', 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ id: string; time: string } | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const paystackWebViewRef = useRef<PayStackRef>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string>(initialSelectedInsurance);

  const user = useSelector(selectUser);
  const { name, email, profileImage, userId } = user;
  const professionalId = user?.professional?._id;
  const userEmail = useSelector((state) => state.user.email);
  const patientName = useSelector((state) => state.user.name);
  const dispatch = useDispatch();
  const { schedule, fetchSchedule, clearCache, updateSlot } = useSchedule();

  const [dateOptions, setDateOptions] = useState<Array<Date>>(
    Array.from({ length: 7 }).map((_, i) => moment().add(i, 'days').toDate())
  );

  useEffect(() => {
    fetchSchedule(doctorId);
    const today = new Date();
    const availableDates = dateOptions.filter(date => moment(date).isSameOrAfter(today, 'day'));
    setDateOptions(availableDates);
  }, [doctorId]);

  useEffect(() => {
    console.log('Fetched schedule:', schedule);
  }, [schedule]);

  useEffect(() => {
    console.log('Insurance Providers:', insurances); // Log insurance providers
    console.log('Selected Insurance:', selectedInsurance); // Log selected insurance
  }, [insurances, selectedInsurance]);

  const handleBookPress = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot.');
      return;
    }

    const selectedDateTime = moment(`${moment(selectedDate).format('YYYY-MM-DD')} ${selectedTimeSlot.time.split(' - ')[0]}`, 'YYYY-MM-DD HH:mm');
    if (selectedDateTime.isBefore(moment())) {
      Alert.alert('Error', 'Cannot book an appointment in the past.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setShowAlert(false);
    setAlertMessage('');
    setAlertType('success');
    let subaccountCode: string | null = null;

    const fetchSubaccountCode = async (professionalId: string) => {
      try {
        const response = await axios.get(`https://medplus-health.onrender.com/api/subaccount/${doctorId}`);
        if (response.data.status === 'Success') {
          const { subaccount_code } = response.data.data;
          subaccountCode = subaccount_code;
        } else {
          console.error('Failed to fetch subaccount code:', response.data.message);
        }
      } catch (error) {
        console.error('Failed to fetch subaccount code:', error);
      }
    };

    await fetchSubaccountCode(professionalId);

    try {
      if (!subaccountCode || !userEmail) {
        throw new Error('Missing subaccount code or user email.');
      }

      const appointmentResponse = await axios.post('https://medplus-health.onrender.com/api/appointments', {
        doctorId,
        userId,
        patientName,
        date: moment(selectedDate).format('YYYY-MM-DD'),
        timeSlotId: selectedTimeSlot.id,
        time: selectedTimeSlot.time,
        status: selectedInsurance ? 'pending' : 'pending',
        insurance: selectedInsurance,
      });

      const newAppointmentId = appointmentResponse.data.appointment._id;
      if (!newAppointmentId) {
        throw new Error('Failed to retrieve appointmentId from response');
      }
      console.log('New appointment ID:', newAppointmentId);
      setAppointmentId(newAppointmentId);
      updateSlot(selectedTimeSlot.id, { isBooked: true });

      if (selectedInsurance) {
        setAlertMessage('Appointment booked successfully with insurance.');
        setAlertType('success');
        setShowAlert(true);
        setIsSubmitting(false);
        return;
      }

      const paymentResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: userEmail,
          amount: consultationFee * 100,
          subaccount: subaccountCode,
          currency: 'KES',
          metadata: {
            appointmentId: newAppointmentId,
            timeSlotId: selectedTimeSlot.id,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (paymentResponse.data.status) {
        if (paystackWebViewRef.current) {
          paystackWebViewRef.current.startTransaction();
        }
      } else {
        throw new Error('Payment initialization failed');
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (response: any) => {
    setIsSubmitting(false);
    setAlertMessage('Payment successful and appointment confirmed!');
    setAlertType('success');
    setShowAlert(true);

    try {
      if (!appointmentId) {
        throw new Error('No appointment ID available for status update.');
      }

      const confirmResponse = await axios.patch(
        `https://medplus-health.onrender.com/api/appointments/confirm/${appointmentId}`,
        { status: 'confirmed' }
      );
      console.log('Confirm response:', confirmResponse.data);

      fetchSchedule(doctorId);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setAlertMessage('Failed to update appointment status.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handlePaymentCancel = () => {
    setIsSubmitting(false);
    setAlertMessage('Payment was canceled.');
    setAlertType('error');
    setShowAlert(true);
  };

  const resetForm = () => {
    setSelectedDate(new Date());
    setSelectedTimeSlot(null);
  };

  const groupedSlots = schedule.reduce((acc: Record<string, { date: string; startTime: string; endTime: string; isBooked: boolean; _id: string }[]>, slot) => {
    const date = moment(slot.date).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const markedDates = Object.keys(groupedSlots).reduce((acc: Record<string, { marked: boolean }>, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book an Appointment</Text>
      <FlatList
        horizontal
        data={dateOptions}
        keyExtractor={(item) => item.toISOString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedDate(item)}
            style={[
              styles.dateButton,
              selectedDate.toDateString() === item.toDateString() ? { backgroundColor: Colors.goofy } : null,
            ]}
          >
            <Text style={styles.dateText}>{moment(item).format('ddd, DD')}</Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
      />
      <Text style={styles.dateTitle}>{moment(selectedDate).format('dddd, MMMM Do YYYY')}</Text>
      
      {/* Insurance Provider Selection */}
      <Text style={styles.insuranceTitle}>Select Insurance Provider</Text>
      <Picker
        selectedValue={selectedInsurance}
        onValueChange={(itemValue) => setSelectedInsurance(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Insurance" value="" />
        {insurances.map((insurance, index) => (
          <Picker.Item key={index} label={insurance} value={insurance} />
        ))}
      </Picker>

      {/* Time Slot Selection */}
      <FlatList
        data={groupedSlots[moment(selectedDate).format('YYYY-MM-DD')] || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isPast = moment(item.startTime, 'h:mma').isBefore(moment());
          return (
            <TouchableOpacity
              disabled={item.isBooked || isPast}
              onPress={() => {
                if (item.isBooked) {
                  Alert.alert('Unavailable', 'This time slot is already booked.');
                  return;
                }
                setSelectedTimeSlot(item);
              }}
              style={[
                styles.timeSlot,
                item.isBooked && { backgroundColor: Colors.gray },
                isPast && { backgroundColor: Colors.lightGray },
                selectedTimeSlot?.id === item._id && { backgroundColor: Colors.darkGreen },
              ]}
            >
              <Text>{`${item.startTime} - ${item.endTime}`}</Text>
            </TouchableOpacity>
          );
        }}
      />

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertType === 'error' ? 'Error' : 'Success'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        onConfirmPressed={() => setShowAlert(false)}
      />

      <TouchableOpacity style={styles.button} onPress={handleBookPress} disabled={isSubmitting}>
        <Text style={styles.buttonText}>{isSubmitting ? 'Booking...' : 'Book Appointment'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  dateButton: { marginRight: 10, padding: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  dateText: { color: '#fff' },
  dateTitle: { fontSize: 18, marginVertical: 10 },
  timeSlot: {
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 5,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  button: { padding: 12, backgroundColor: Colors.primary, borderRadius: 5, marginTop: 20 },
  buttonText: { color: '#fff', textAlign: 'center' },
  insuranceTitle: { marginTop: 20, fontSize: 16, fontWeight: 'bold' },
  picker: { height: 50, width: '100%' },
});

export default BookingSection;
