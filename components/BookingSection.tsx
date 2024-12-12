import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import moment from 'moment';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack, PayStackRef } from 'react-native-paystack-webview';
import axios from 'axios';
import Colors from './Shared/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../app/store/userSlice';
import useSchedule from '../hooks/useSchedule'; // Import the useSchedule hook
import io from 'socket.io-client';
import EnhancedCalendar from '../../components/doctor/calendar/EnhancedCalendar'; // Import EnhancedCalendar

const BookingSection: React.FC<{ doctorId: string; consultationFee: number; insurances?: string[]; selectedInsurance?: string }> = ({
  doctorId,
  consultationFee,
  insurances = [], // Default to an empty array if insurances is not provided
  selectedInsurance: initialSelectedInsurance = '', // Default to an empty string if selectedInsurance is not provided
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
  const { schedule, fetchSchedule, updateSlot, fetchScheduleForDate } = useSchedule();
 
  const socket = useRef(io('https://medplus-health.onrender.com')).current;

  useEffect(() => {
    socket.on('newAppointment', ({ appointment, userId, doctorId }) => {
      if (userId === user.userId) {
        Alert.alert('New Appointment', `You have a new appointment with Dr. ${appointment.doctorId}`);
        fetchSchedule(doctorId); // Refresh the schedule
      }
    });

    return () => {
      socket.off('newAppointment');
    };
  }, [user.userId, doctorId]);

  useEffect(() => {
    fetchSchedule(doctorId);
  }, [doctorId]);

  useEffect(() => {
    console.log('Fetched schedule:', schedule);
  }, [schedule]);

  useEffect(() => {
    const fetchScheduleForSelectedDate = async () => {
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
      const slots = await fetchScheduleForDate(doctorId, formattedDate);
      setGroupedSlots({ [formattedDate]: slots });
    };

    fetchScheduleForSelectedDate();
  }, [selectedDate, doctorId]);

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

    if (isSubmitting) {
      return;
    }

    console.log('Selected Time Slot:', selectedTimeSlot); // Add this line to log selectedTimeSlot

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
        doctorId: doctorId,
        userId: userId,
        patientName: patientName,
        date: moment(selectedDate).format('YYYY-MM-DD'), 
        timeSlotId: selectedTimeSlot.id, // Ensure timeSlotId is included
        time: selectedTimeSlot.time,
        status: selectedInsurance ? 'pending' : 'pending',
        insurance: selectedInsurance, // Include insurance in the appointment data
      });

      const newAppointmentId = appointmentResponse.data.appointment._id; // Ensure correct path to appointment ID
      if (!newAppointmentId) {
        throw new Error('Failed to retrieve appointmentId from response');
      }
      console.log('New appointment ID:', newAppointmentId); // Log the appointmentId from the response
      setAppointmentId(newAppointmentId);

      // Log the state after setting the appointmentId
      console.log('State after setting appointmentId:', { appointmentId: newAppointmentId });

      // Update the slot to booked in the local state
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
      if (error.response && error.response.data && error.response.data.error) {
        setAlertMessage(`Failed to book appointment: ${error.response.data.error}`);
      } else {
        setAlertMessage('Failed to book appointment. Please try again.');
      }
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };
  const appointmentIdRef = useRef<string | null>(null);

  useEffect(() => {
    appointmentIdRef.current = appointmentId;
  }, [appointmentId]);

  const handlePaymentSuccess = async (response: any) => {
    setIsSubmitting(false);
    setAlertMessage('Payment successful and appointment confirmed!');
    setAlertType('success');
    setShowAlert(true);
    console.log('Payment successful:', response);

    try {
      const currentAppointmentId = appointmentIdRef.current;
      console.log('State before confirming appointment:', { appointmentId: currentAppointmentId });

      if (!currentAppointmentId) {
        throw new Error('No appointment ID available for status update.');
      }
      console.log('Confirming appointment with ID:', currentAppointmentId);

      const confirmResponse = await axios.put(
        `https://medplus-health.onrender.com/api/appointments/confirm/${currentAppointmentId}`,
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

  // Log the groupedSlots to verify the data is grouped correctly
  console.log('Grouped slots:', groupedSlots);

  const markedDates = Object.keys(groupedSlots).reduce((acc: Record<string, { marked: boolean }>, date) => {
    acc[date] = { marked: true };
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book an Appointment</Text>
      <EnhancedCalendar
        markedDates={markedDates}
        onDayPress={(date) => setSelectedDate(date)}
      />
      <Text style={styles.dateTitle}>{moment(selectedDate).format('dddd, MMMM Do YYYY')}</Text>
      <FlatList
        data={groupedSlots[moment(selectedDate).format('YYYY-MM-DD')] || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.shiftContainer}>
            <Text style={styles.shiftTitle}>{item.name}</Text>
            <Text style={styles.availableSlotsTitle}>Available Time Slots:</Text>
            <FlatList
              horizontal
              data={item.timeSlots}
              keyExtractor={(slot, index) => index.toString()}
              renderItem={({ slot }) => {
                const slotTime = moment(`${moment(selectedDate).format('YYYY-MM-DD')} ${slot.start}`, 'YYYY-MM-DD HH:mm');
                const isPast = slotTime.isBefore(moment());
                return (
                  <TouchableOpacity
                    onPress={() => {
                      if (isPast) {
                        Alert.alert('Invalid slot', 'Cannot select a past time slot.');
                      } else {
                        setSelectedTimeSlot({ id: item._id, time: `${slot.start} - ${slot.end}` });
                      }
                    }}
                    style={[
                      styles.slotButton,
                      isPast ? { backgroundColor: Colors.SECONDARY } : { backgroundColor: Colors.goofy },
                      selectedTimeSlot && selectedTimeSlot.id === item._id
                        ? { borderColor: Colors.SECONDARY, borderWidth: 2, backgroundColor: Colors.selectedBackground }
                        : {},
                    ]}
                    disabled={isPast}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        selectedTimeSlot && selectedTimeSlot.id === item._id
                          ? { color: Colors.selectedText }
                          : {},
                      ]}
                    >
                      {`${slot.start} - ${slot.end}`}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}
      />
      <Text style={styles.insuranceTitle}>Accepted Insurances</Text>
      {insurances.length > 0 ? (
        <FlatList
          horizontal
          data={insurances}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedInsurance(item)}
              style={[
                styles.insuranceCard,
                item === selectedInsurance ? styles.selectedInsuranceCard : null
              ]}
            >
              <Text style={[
                styles.insuranceText,
                item === selectedInsurance ? styles.selectedInsuranceText : null
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noInsuranceText}>No insurances available</Text>
      )}
      <TouchableOpacity style={styles.bookButton} onPress={handleBookPress} disabled={isSubmitting}>
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>

      <AwesomeAlert
        show={showAlert}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        onConfirmPressed={() => {
          setShowAlert(false);
          if (alertType === 'success') resetForm();
        }}
      />

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        billingEmail={userEmail}
        amount={consultationFee}
        currency='KES'
        onCancel={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
        ref={paystackWebViewRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 30
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  dateText: {
    color: Colors.primary,
  },
  dateTitle: {
    fontSize: 18,
    marginVertical: 20,
  },
  shiftContainer: {
    marginBottom: 20,
  },
  shiftTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  availableSlotsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  slotButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  slotText: {
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.SECONDARY,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: Colors.primary,
    fontSize: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  bookedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  insuranceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  insuranceCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  insuranceText: {
    fontSize: 16,
    color: Colors.primary,
  },
  selectedInsuranceCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  selectedInsuranceText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  noInsuranceText: {
    fontSize: 16,
    color: Colors.gray,
    marginVertical: 10,
  },
  clearCacheButton: {
    backgroundColor: Colors.SECONDARY,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  clearCacheButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
});

export default BookingSection;
