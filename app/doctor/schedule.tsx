import React, { useState } from 'react'; 
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, ScrollView } from 'react-native';
import { Button, Chip, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import EnhancedCalendar from '../../components/doctor/calendar/EnhancedCalendar';
import axios from 'axios';

const timeToString = (time: Date) => time.toISOString().split('T')[0];

const Schedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [shiftDetails, updateShiftDetails] = useState({
    startTime: '',
    endTime: '',
    location: '',
    consultations: 0,
    address: '',
    breaks: [] as { start: string; end: string }[],
  });
  const [breakInput, setBreakInput] = useState({ start: '', end: '' });
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({ show: false, type: '' });

  const onTimeChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (showTimePicker.type === 'breakStart' || showTimePicker.type === 'breakEnd') {
        setBreakInput((prev) => ({ ...prev, [showTimePicker.type === 'breakStart' ? 'start' : 'end']: formattedTime }));
      } else {
        updateShiftDetails((prev) => ({
          ...prev,
          [showTimePicker.type]: formattedTime,
        }));
      }
    }
    setShowTimePicker({ show: false, type: '' });
  };

  const addBreak = () => {
    if (breakInput.start && breakInput.end) {
      updateShiftDetails((prev) => ({
        ...prev,
        breaks: [...prev.breaks, breakInput],
      }));
      setBreakInput({ start: '', end: '' });
    }
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
            <EnhancedCalendar
              onDayPress={(date) => {
                setSelectedDay(timeToString(date));
                setCurrentStep(2);
              }}
            />
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
          <Text style={styles.breakTitle}>Set Break Times</Text>
          <View style={styles.timeRow}>
            <Chip onPress={() => setShowTimePicker({ show: true, type: 'breakStart' })}>
              {breakInput.start || 'Start Break'}
            </Chip>
            <Chip onPress={() => setShowTimePicker({ show: true, type: 'breakEnd' })}>
              {breakInput.end || 'End Break'}
            </Chip>
          </View>
          <Button onPress={addBreak} mode="outlined" style={styles.addBreakButton}>
            Add Break
          </Button>
          <Button mode="contained" onPress={goToNextStep} style={styles.nextButton}>
            Next
          </Button>
        </View>
      );
    }

    if (currentStep === 3) {
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Consultation Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Location"
            value={shiftDetails.location}
            onChangeText={(text) => updateShiftDetails((prev) => ({ ...prev, location: text }))}
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter Number of Consultations"
            value={shiftDetails.consultations.toString()}
            onChangeText={(text) => updateShiftDetails((prev) => ({ ...prev, consultations: parseInt(text) }))}
          />
          <Button mode="contained" onPress={() => setCurrentStep(4)} style={styles.nextButton}>
            Next
          </Button>
        </View>
      );
    }

    if (currentStep === 4) {
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderStep()}
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  calendarContainer: {
    width: '100%',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 10,
  },
  breakTitle: {
    fontSize: 18,
    marginVertical: 8,
  },
  addBreakButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  nextButton: {
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
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

export default Schedule;
