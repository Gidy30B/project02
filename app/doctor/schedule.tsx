import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Switch } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { Card, Avatar, Button, TextInput, Snackbar, Chip } from 'react-native-paper';
import Animated from 'react-native-reanimated';

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const Schedule: React.FC = () => {
  const [items, setItems] = useState({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [shiftDetails, setShiftDetails] = useState({
    name: '',
    startTime: '',
    endTime: '',
    breaks: '',
    consultations: '',
    location: '',
  });
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState(false);

  const loadItems = (day) => {
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        if (!items[strTime]) {
          items[strTime] = [];
          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Item for ' + strTime + ' #' + j,
              height: Math.max(50, Math.floor(Math.random() * 150)),
            });
          }
        }
      }
      const newItems = {};
      Object.keys(items).forEach((key) => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };

  const handleSaveShift = () => {
    if (!shiftDetails.name || !shiftDetails.startTime || !shiftDetails.endTime || !shiftDetails.location || !shiftDetails.consultations) {
      setIsSnackbarVisible(true);
      return;
    }

    setItems((prev) => ({
      ...prev,
      [selectedDay!]: [...(prev[selectedDay!] || []), { ...shiftDetails, id: Date.now() }],
    }));

    setShiftDetails({ name: '', startTime: '', endTime: '', breaks: '', consultations: '', location: '' });
    setCurrentStep(1);
    setSelectedDay(null);
  };

  const renderEmptyData = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Please select a day to set your schedule.</Text>
    </View>
  );

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

  const goToPreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <View style={styles.container}>
      {currentStep === 1 ? (
        <Agenda
          items={items}
          loadItemsForMonth={loadItems}
          selected={selectedDay}
          onDayPress={(day) => {
            setSelectedDay(day.dateString);
            setCurrentStep(2); // Move to the first step after selecting a day
          }}
          renderEmptyData={renderEmptyData}
        />
      ) : (
        <Animated.View style={styles.formContainer}>
          <Text style={styles.formTitle}>{currentStep}: How would you like to schedule your day?</Text>
          <ScrollView>
            {currentStep === 2 && (
              <View>
                <TextInput
                  label="Shift Name"
                  value={shiftDetails.name}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, name: text })}
                  mode="outlined"
                  style={styles.input}
                />
                <TextInput
                  label="Work starts at ?"
                  value={shiftDetails.startTime}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, startTime: text })}
                  placeholder="e.g., 9:00 AM"
                  style={styles.input}
                />
                <TextInput
                  label="Work ends at ?"
                  value={shiftDetails.endTime}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, endTime: text })}
                  placeholder="e.g., 5:00 PM"
                  style={styles.input}
                />
              </View>
            )}

            {currentStep === 3 && (
              <View>
                <TextInput
                  label="Breaks (Optional)"
                  value={shiftDetails.breaks}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, breaks: text })}
                  placeholder="e.g., 12:00 PM - 1:00 PM"
                  style={styles.input}
                />
                <TextInput
                  label="Consultations"
                  value={shiftDetails.consultations}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, consultations: text })}
                  placeholder="e.g., 10"
                  style={styles.input}
                />
                <TextInput
                  label="Location"
                  value={shiftDetails.location}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, location: text })}
                  placeholder="e.g., Downtown Clinic"
                  style={styles.input}
                />
                <View style={styles.switchContainer}>
                  <Text>Repeat Weekly</Text>
                  <Switch value={isRecurring} onValueChange={(val) => setIsRecurring(val)} />
                </View>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {currentStep > 2 && (
                <Button mode="outlined" onPress={goToPreviousStep} style={styles.navButton}>
                  Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button mode="contained" onPress={goToNextStep} style={styles.navButton}>
                  Next
                </Button>
              ) : (
                <Button mode="contained" onPress={handleSaveShift} style={styles.navButton}>
                  Save Schedule
                </Button>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      )}

      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        Please complete all required fields!
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
  formContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  chip: {
    marginVertical: 8,
  },
  snackbar: {
    backgroundColor: '#f44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});