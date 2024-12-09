import { StyleSheet, Text, View, Switch } from 'react-native';
import React, { useState, useCallback, memo } from 'react';
import { Agenda, AgendaEntry } from 'react-native-calendars';
import { TouchableOpacity, TextInput, Animated, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For plus icon
import { Button, Card } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Import Picker component

const Schedule = () => {
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
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [agendaItems, setAgendaItems] = useState<{ [date: string]: AgendaEntry[] }>({});
  const [shifts, setShifts] = useState<Array<typeof shiftDetails>>([]);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [selectedPredefinedShift, setSelectedPredefinedShift] = useState<string>(''); // Existing state

  // Define predefined shifts including "Custom Shift"
  const predefinedShifts = [
    { label: 'Morning Shift', value: 'Morning Shift' },
    { label: 'Afternoon Shift', value: 'Afternoon Shift' },
    { label: 'Night Shift', value: 'Night Shift' },
    { label: 'Custom Shift', value: 'Custom Shift' }, // Added Custom Shift
    // ...existing predefined shifts...
  ];

  // Define an array of subtle background colors for each step
  const stepBackgroundColors = [
    '#ffffff', // Step 1
    '#f9f9ff', // Step 2
    '#f0f0ff', // Step 3
    '#e9e9ff', // Step 4
    '#e0e0ff', // Step 5
    '#d9d9ff', // Step 6
  ];

  const onDayPress = (day: any) => {
    setSelectedDay(day.dateString);
    setIsFormVisible(true);
    setCurrentStep(1);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSaveShift = () => {
    shifts.forEach((shift) => {
      const newShiftId = `${Date.now()}-${Math.random()}`;
      const newShift: AgendaEntry = { ...shift, id: newShiftId };

      setAgendaItems((prevItems) => {
        const date = selectedDay!;
        const existingShifts = prevItems[date] || [];
        return {
          ...prevItems,
          [date]: [...existingShifts, newShift],
        };
      });

      if (isRecurring) {
        const nextDate = new Date(selectedDay!);
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

    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsFormVisible(false);
      setShifts([]);
      setIsRecurring(false);
      setCurrentStep(1);
    });
  };

  const handleSaveAndAddAnotherShift = () => {
    setShifts([...shifts, { ...shiftDetails }]);
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

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
      setShiftDetails({ ...shiftDetails, startTime: selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
      setShiftDetails({ ...shiftDetails, endTime: selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    }
  };

  const handlePredefinedShiftChange = (value: string) => {
    setSelectedPredefinedShift(value);
    if (value !== 'Custom Shift') {
      setShiftDetails({ ...shiftDetails, name: value });
    } else {
      setShiftDetails({ ...shiftDetails, name: '' });
    }
  };

  const renderEmptyData = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Please select a day to schedule your availability.</Text>
    </View>
  );

  const formHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  // Adjusted AgendaItem component to handle a single AgendaEntry
  const AgendaItem = memo(({ item }: { item: AgendaEntry }) => (
    <View style={styles.agendaItemContainer}>
      <View style={styles.agendaShiftItem}>
        <Text style={styles.agendaItemText}>{item.name}</Text>
        <Text style={styles.agendaShiftText}>Start: {item.startTime}</Text>
        <Text style={styles.agendaShiftText}>End: {item.endTime}</Text>
        <Text style={styles.agendaShiftText}>Breaks: {item.breaks}</Text>
      </View>
    </View>
  ));

  // Memoized renderItem function passing a single AgendaEntry
  const renderItem = useCallback((item: AgendaEntry) => <AgendaItem item={item} />, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Agenda
          items={agendaItems}
          onDayPress={onDayPress}
          renderItem={renderItem}
          renderEmptyData={renderEmptyData}
        />

        {isFormVisible && selectedDay && (
          <Animated.View style={[
            styles.formContainer, 
            { 
              height: formHeight,
              backgroundColor: stepBackgroundColors[currentStep - 1] || '#ffffff', // Dynamic background
            }
          ]}>
            <View style={styles.formHeader}>
              <Ionicons name="calendar" size={24} color="#333" />
              <Text style={styles.formTitle}>Proceed to Schedule Your Day</Text>
            </View>
            {/* Step forms are rendered conditionally based on currentStep */}
            {currentStep === 1 && (
              <>
                <Picker
                  selectedValue={selectedPredefinedShift}
                  onValueChange={(itemValue) => handlePredefinedShiftChange(itemValue)}
                  style={styles.picker}
                  prompt="Select a Shift"
                >
                  <Picker.Item label="Select a predefined shift..." value="" />
                  {predefinedShifts.map((shift, index) => (
                    <Picker.Item key={index} label={shift.label} value={shift.value} />
                  ))}
                </Picker>
                {selectedPredefinedShift === 'Custom Shift' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Enter custom shift name"
                    value={shiftDetails.name}
                    onChangeText={(text) => setShiftDetails({ ...shiftDetails, name: text })}
                  />
                )}
              </>
            )}
            {currentStep === 2 && (
              <View>
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={styles.timePickerButton}>
                  <Text style={styles.timePickerText}>
                    {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Work starts at ?'}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime || new Date()}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onStartTimeChange}
                  />
                )}
              </View>
            )}
            {currentStep === 3 && (
              <View>
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.timePickerButton}>
                  <Text style={styles.timePickerText}>
                    {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Work ends at ?'}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime || new Date()}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
            )}
              {currentStep === 4 && (
              <View>
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.timePickerButton}>
                  <Text style={styles.timePickerText}>
                    {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'set up your break ?'}
                  </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime || new Date()}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
            )}
            
            
            {currentStep === 5 && (
              <View>
                <Text>Repeat the schedule?</Text>
                <Switch value={isRecurring} onValueChange={setIsRecurring} />
              </View>
            )}
            {currentStep === 6 && (
              <View>
                <Button mode="contained" onPress={handleSaveShift} style={styles.button}>
                  Save
                </Button>
                <Button mode="outlined" onPress={handleSaveAndAddAnotherShift} style={styles.button}>
                  Save and Add Another Shift
                </Button>
              </View>
            )}
      {shifts.length > 0 && (
  <View style={styles.shiftPreviewContainer}>
    <Text style={styles.previewTitle}>Added Shifts:</Text>
    <ScrollView style={styles.scrollableShifts}>
      {shifts.map((shift, index) => (
        <Card key={index} style={styles.shiftPreviewCard}>
          <Card.Content>
            <View style={styles.shiftHeader}>
              <Ionicons name="briefcase" size={20} color="#555" />
              <Text style={styles.shiftName}>{shift.name}</Text>
            </View>
            <View style={styles.shiftDetails}>
              <Text style={styles.shiftDetailText}>Start: {shift.startTime}</Text>
              <Text style={styles.shiftDetailText}>End: {shift.endTime}</Text>
              <Text style={styles.shiftDetailText}>Breaks: {shift.breaks}</Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  </View>
)}

            <View style={styles.navigationButtons}>
              <TouchableOpacity onPress={handlePrevious} style={styles.navButton}>
                <Ionicons name="arrow-back-circle" size={30} color="#333" />
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={styles.navButton}>
                <Ionicons name="arrow-forward-circle" size={30} color="#333" />
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
            <Button 
              mode="text" 
              onPress={handleCancel} 
              style={styles.cancelButton}
              icon="cancel"
            >
              Cancel
            </Button>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    
  },
  scrollContainer: { flexGrow: 1 },
  agendaItem: { 
    padding: 10, 
    margin: 5, 
    backgroundColor: '#fff', 
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    
    
  },
  agendaItemContainer: {
    flexDirection: 'column',
  },
  agendaShiftItem: {
    marginBottom: 5,
  },
  agendaShiftText: {
    fontSize: 14,
    color: '#555',
  },
  agendaItemText: { fontSize: 16, fontWeight: 'bold' },
  agendaItemSubText: { fontSize: 14, color: '#555' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#555' },
  formContainer: { 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    padding: 15,
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  formTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 8, // Space between icon and text
    color: '#333',
  },
  shiftPreviewContainer: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scrollableShifts: {
    maxHeight: 200, // Limit the height to 200px
  },
  shiftPreviewCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  shiftName: {
    marginLeft: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  shiftDetails: {
    marginTop: 5,
  },
  shiftDetailText: {
    fontSize: 14,
    color: '#555',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  navButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#333',
    backgroundColor: '#f0f2f5',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    color: '#555',
  },
});
