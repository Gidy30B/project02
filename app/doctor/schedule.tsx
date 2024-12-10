import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Button, Chip, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import EnhancedCalendar from '../../components/doctor/calendar/EnhancedCalendar';
import axios from 'axios';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const Schedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [shiftDetails, updateShiftDetails] = useState({
    startTime: '',
    endTime: '',
    location: '',
    consultations: 0,
    address: '',
    breaks: [],
  });
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({ show: false, type: '' });

  const onTimeChange = (event: Event, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      updateShiftDetails((prev) => ({
        ...prev,
        [showTimePicker.type]: formattedTime,
      }));
    }
    setShowTimePicker({ show: false, type: '' });
  };

  const handleSaveShift = async () => {
    if (!shiftDetails.startTime || !shiftDetails.endTime || !shiftDetails.location || !selectedDay || !shiftDetails.consultations || !shiftDetails.address) {
      setIsSnackbarVisible(true);
      return;
    }

    const availability = [{ ...shiftDetails, date: selectedDay, isBooked: false }];
    try {
      const response = await axios.post('/api/schedule', {
        professionalId: 'your-professional-id',
        availability,
      });
      console.log('Shift saved:', response.data);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }

    updateShiftDetails({ startTime: '', endTime: '', location: '', consultations: 0, address: '', breaks: [] });
    setCurrentStep(1);
    setSelectedDay(null);
  };

  const goToNextStep = () => {
    if (currentStep === 2 && (!shiftDetails.startTime || !shiftDetails.endTime)) {
      setIsSnackbarVisible(true);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select a Day</Text>
          <View style={styles.calendarContainer}>
            <EnhancedCalendar onDayPress={(date) => {
              setSelectedDay(timeToString(date));
              setCurrentStep(2);
            }} />
          </View>
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Set Your Work Hours</Text>
          <View style={styles.timeRow}>
            <Chip
              mode="outlined"
              onPress={() => setShowTimePicker({ show: true, type: 'startTime' })}
              selected={!!shiftDetails.startTime}
            >
              {shiftDetails.startTime || 'Start Time'}
            </Chip>
            <Chip
              mode="outlined"
              onPress={() => setShowTimePicker({ show: true, type: 'endTime' })}
              selected={!!shiftDetails.endTime}
            >
              {shiftDetails.endTime || 'End Time'}
            </Chip>
          </View>
          <Button mode="contained" onPress={goToNextStep} style={styles.nextButton}>
            Next
          </Button>
        </View>
      );
    }

    if (currentStep === 3) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select Your Location</Text>
          <FlatList
            data={['Clinic A', 'Clinic B', 'Home Office', 'Remote']}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.locationCard,
                  shiftDetails.location === item && styles.selectedCard,
                ]}
                onPress={() => updateShiftDetails((prev) => ({ ...prev, location: item }))}
              >
                <Text style={styles.cardText}>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <Button mode="contained" onPress={goToNextStep} style={styles.nextButton}>
            Next
          </Button>
        </View>
      );
    }

    if (currentStep === 4) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Set Number of Consultations</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={shiftDetails.consultations.toString()}
            onChangeText={(text) => updateShiftDetails((prev) => ({ ...prev, consultations: parseInt(text) }))}
          />
          <Button mode="contained" onPress={goToNextStep} style={styles.nextButton}>
            Next
          </Button>
        </View>
      );
    }

    if (currentStep === 5) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Set Your Address</Text>
          <TextInput
            style={styles.input}
            value={shiftDetails.address}
            onChangeText={(text) => updateShiftDetails((prev) => ({ ...prev, address: text }))}
          />
          <Button mode="contained" onPress={handleSaveShift} style={styles.nextButton}>
            Save Schedule
          </Button>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
      {showTimePicker.show && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          is24Hour={false}
          display="spinner"
          onChange={onTimeChange}
        />
      )}
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        Please complete the required fields!
      </Snackbar>
    </View>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  calendarContainer: {
    flex: 1,
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginVertical: 16,
  },
  nextButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  locationCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    margin: 8,
  },
  selectedCard: {
    borderColor: '#6200ea',
    backgroundColor: '#e0e0e0',
  },
  cardText: {
    fontSize: 16,
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 16,
  },
});
