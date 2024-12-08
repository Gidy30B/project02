import { StyleSheet, Text, View, Switch } from 'react-native'
import React, { useState } from 'react'
import { Agenda, AgendaEntry } from 'react-native-calendars';
import { TouchableOpacity, TextInput, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For plus icon
import { Button } from 'react-native-paper';

const schedule = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [shiftDetails, setShiftDetails] = useState({
    name: '',
    startTime: '',
    endTime: '',
    breaks: '',
  });
  const [animation] = useState(new Animated.Value(0));
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isRecurring, setIsRecurring] = useState<boolean>(false); // New state for recurrence
  const [agendaItems, setAgendaItems] = useState<{ [date: string]: AgendaEntry[] }>({
    '2021-09-01': [{ name: 'Morning walk', id: '1' }],
    '2021-09-02': [{ name: 'Meeting with client', id: '2' }],
    '2021-09-03': [{ name: 'Dentist appointment', id: '3' }],
    '2021-09-04': [{ name: 'Grocery shopping', id: '4' }],
    '2021-09-05': [{ name: 'Yoga class', id: '5' }],
  });
  const [shifts, setShifts] = useState<Array<{
    name: string;
    startTime: string;
    endTime: string;
    breaks: string;
  }>>([]); // New state to hold multiple shifts

  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
    setIsFormVisible(true);
    setCurrentStep(1); // Reset to first step when a new day is selected
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSaveShift = () => {
    shifts.forEach((shift) => {
      const newShiftId = Date.now().toString() + Math.random().toString(); // Ensure unique ID
      const newShift: AgendaEntry = {
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        breaks: shift.breaks,
        id: newShiftId,
      };

      setAgendaItems((prevItems) => {
        const date = selectedDay!;
        const existingShifts = prevItems[date] || [];
        return {
          ...prevItems,
          [date]: [...existingShifts, newShift],
        };
      });

      if (isRecurring) { // Apply global recurrence
        const nextDate = new Date(selectedDay);
        nextDate.setDate(nextDate.getDate() + 7);
        const nextDateString = nextDate.toISOString().split('T')[0];

        setAgendaItems((prevItems) => {
          const existingShifts = prevItems[nextDateString] || [];
          return {
            ...prevItems,
            [nextDateString]: [...existingShifts, newShift],
          };
        });
      }
    });

    // Reset animations and form visibility
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsFormVisible(false);
      setShifts([]); // Clear all shifts after saving
      setIsRecurring(false); // Reset recurrence
      setCurrentStep(1);
    });
  };

  // Add a new handler for saving and adding another shift
  const handleSaveAndAddAnotherShift = () => {
    setShifts([...shifts, { ...shiftDetails }]);
    // Reset shift details and form steps
    setShiftDetails({
      name: '',
      startTime: '',
      endTime: '',
      breaks: '',
    });
    setCurrentStep(1);
  };

  const handleCancel = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsFormVisible(false);
      setShiftDetails({
        name: '',
        startTime: '',
        endTime: '',
        breaks: '',
      });
    });
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Adjust height as needed
  });

  // New function to render when there are no items for the selected day
  const renderEmptyData = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.promptText}>Please select a day from the calendar to set up your availability.</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Agenda
          items={agendaItems}
          onDayPress={onDayPress}
          renderItem={(item: AgendaEntry) => (
            <View style={styles.agendaItem}>
              <Text style={styles.agendaItemText}>{item.name}</Text>
              <Text style={styles.agendaItemSubText}>Start: {item.startTime}</Text>
              <Text style={styles.agendaItemSubText}>End: {item.endTime}</Text>
              <Text style={styles.agendaItemSubText}>Breaks: {item.breaks}</Text>
            </View>
          )}
          renderEmptyData={renderEmptyData} // Centered prompt when no agenda
        />

        {/* Collapsible Shift Creation Form */}
        {isFormVisible && selectedDay && (
          <Animated.View style={[styles.formContainer, { height: formHeight }]}>

            <Text style={styles.formTitle}>How would you like to schedule your day?</Text>

            {/* Step 1: Shift Name */}
            {currentStep === 1 && (
              <View>
                <Text style={styles.stepSubtitle}>Step 1: Select Shift Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select or Enter Shift Name"
                  value={shiftDetails.name}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, name: text })}
                />
                <View style={styles.navigationButtons}>
                  <Button mode="contained" onPress={handleNext} disabled={!shiftDetails.name}>
                    Next
                  </Button>
                </View>
              </View>
            )}

            {/* Step 2: Work Starts and Ends */}
            {currentStep === 2 && (
              <View>
                <Text style={styles.stepSubtitle}>Step 2: Define Working Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Work Starts (e.g., 09:00 AM)"
                  value={shiftDetails.startTime}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, startTime: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Work Ends (e.g., 05:00 PM)"
                  value={shiftDetails.endTime}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, endTime: text })}
                />
                <View style={styles.navigationButtons}>
                  <Button mode="outlined" onPress={handlePrevious}>
                    Previous
                  </Button>
                  <Button mode="contained" onPress={handleNext} disabled={!shiftDetails.startTime || !shiftDetails.endTime}>
                    Next
                  </Button>
                </View>
              </View>
            )}

            {/* Step 3: Specify Breaks */}
            {currentStep === 3 && (
              <View>
                <Text style={styles.stepSubtitle}>Step 3: Specify Breaks</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Breaks (e.g., 12:00 PM - 12:30 PM)"
                  value={shiftDetails.breaks}
                  onChangeText={(text) => setShiftDetails({ ...shiftDetails, breaks: text })}
                />
                <View style={styles.navigationButtons}>
                  <Button mode="outlined" onPress={handlePrevious}>
                    Previous
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleNext}
                    disabled={!shiftDetails.breaks}
                  >
                    Next
                  </Button>
                </View>
              </View>
            )}

            {/* Step 4: Add Another Shift or Proceed to Recurrence */}
            {currentStep === 4 && (
              <View>
                <Text style={styles.stepSubtitle}>Step 4: Add Another Shift</Text>
                <View style={styles.navigationButtons}>
                  <Button mode="outlined" onPress={handlePrevious}>
                    Previous
                  </Button>
                  <Button mode="contained" onPress={handleSaveAndAddAnotherShift} disabled={!shiftDetails.name || !shiftDetails.startTime || !shiftDetails.endTime}>
                    Add Another Shift
                  </Button>
                  <Button mode="contained" onPress={handleNext} disabled={shifts.length === 0}>
                    Proceed to Recurrence
                  </Button>
                </View>
              </View>
            )}

            {/* Step 5: Specify Recurrence */}
            {currentStep === 5 && (
              <View>
                <Text style={styles.stepSubtitle}>Step 5: Specify Recurrence</Text>
                <View style={styles.recurringContainer}>
                  <Text style={styles.recurringLabel}>Repeat Weekly on {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long' })}?</Text>
                  <Switch
                    value={isRecurring}
                    onValueChange={(value) => setIsRecurring(value)}
                  />
                </View>
                <View style={styles.navigationButtons}>
                  <Button mode="outlined" onPress={handlePrevious}>
                    Previous
                  </Button>
                  <Button mode="contained" onPress={handleNext}>
                    Next
                  </Button>
                </View>
              </View>
            )}

            {/* Step 6: Preview All Shifts */}
            {currentStep === 6 && (
              <View>
                <Text style={styles.stepSubtitle}>Step 6: Preview All Shifts</Text>
                <View style={styles.previewContainer}>
                  {shifts.map((shift, index) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                      <Text style={styles.previewText}><Text style={styles.previewLabel}>Shift {index + 1} Name:</Text> {shift.name}</Text>
                      <Text style={styles.previewText}><Text style={styles.previewLabel}>Work Starts:</Text> {shift.startTime}</Text>
                      <Text style={styles.previewText}><Text style={styles.previewLabel}>Work Ends:</Text> {shift.endTime}</Text>
                      <Text style={styles.previewText}><Text style={styles.previewLabel}>Breaks:</Text> {shift.breaks}</Text>
                    </View>
                  ))}
                  <Text style={styles.previewText}><Text style={styles.previewLabel}>Recurring:</Text> {isRecurring ? 'Yes, Weekly' : 'No'}</Text>
                </View>
                <View style={styles.navigationButtons}>
                  <Button mode="outlined" onPress={handlePrevious}>
                    Previous
                  </Button>
                  <Button mode="contained" onPress={handleSaveShift}>
                    Save All Shifts
                  </Button>
                </View>
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default schedule

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // ...existing styles...
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
  },
  promptText: { // New style for the prompt message
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  formContainer: {
    // Removed absolute positioning to integrate the form into the layout
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
    // Animated height controls visibility
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  stepSubtitle: { // New style for step subtitles
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  navigationButtons: { // Updated style for navigation buttons
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  previewContainer: { // New style for preview section
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  previewText: { // New style for preview text
    fontSize: 16,
    marginBottom: 5,
  },
  previewLabel: { // New style for preview labels
    fontWeight: '600',
  },
  recurringContainer: { // New style for recurrence section
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  recurringLabel: { // New style for recurrence label
    fontSize: 16,
  },
  agendaItem: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 8,
  },
  agendaItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0d47a1',
  },
  agendaItemSubText: {
    fontSize: 14,
    color: '#1976d2',
  },
})