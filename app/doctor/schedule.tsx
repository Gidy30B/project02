import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Animated } from 'react-native';
import { Button, Chip, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import EnhancedCalendar from '../../components/doctor/calendar/EnhancedCalendar';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};
const Schedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [shiftDetails, setShiftDetails] = useState({
    startTime: '',
    endTime: '',
    location: '',
  });
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({ show: false, type: '' });

  const onTimeChange = (event: Event, selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedTime = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setShiftDetails((prev) => ({
        ...prev,
        [showTimePicker.type]: formattedTime,
      }));
    }
    setShowTimePicker({ show: false, type: '' });
  };

  const handleSaveShift = () => {
    if (!shiftDetails.startTime || !shiftDetails.endTime || !shiftDetails.location || !selectedDay) {
      setIsSnackbarVisible(true);
      return;
    }

    console.log('Shift saved:', { ...shiftDetails, day: selectedDay });
    setShiftDetails({ startTime: '', endTime: '', location: '' });
    setCurrentStep(1);
    setSelectedDay(null);
  };

  const goToNextStep = () => {
    if (currentStep === 1 && !selectedDay) {
      setIsSnackbarVisible(true);
      return;
    }
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
          <EnhancedCalendar
            onDayPress={(date) => setSelectedDay(date)}
          />
          <Button mode="contained" onPress={goToNextStep} style={styles.nextButton}>
            Next
          </Button>
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
                onPress={() => setShiftDetails((prev) => ({ ...prev, location: item }))}
              >
                <Text style={styles.cardText}>{item}</Text>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
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
    padding: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
});