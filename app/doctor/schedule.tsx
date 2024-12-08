import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars'; // Import the Calendar component
import moment from 'moment'; // Install moment.js for easier date manipulation
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Collapsible from 'react-native-collapsible';

interface Shift {
  name: string; // Added shift name
  day: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
  breaks: { start: string; end: string }[];
  isRecurring: boolean;
}

const Schedule: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newShift, setNewShift] = useState<Shift>({
    name: '', // Initialize shift name
    day: '',
    startTime: '',
    endTime: '',
    maxPatients: 0,
    breaks: [],
    isRecurring: false,
  });
  const [isWeekView, setIsWeekView] = useState<boolean>(true);
  const [currentWeekDates, setCurrentWeekDates] = useState<{ [key: string]: any }>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null); // New state for selected day
  const [shiftStep, setShiftStep] = useState<number>(0); // New state to track steps
  const [shifts, setShifts] = useState<{ [key: string]: Shift[] }>({}); // Updated state to handle multiple shifts
  const [isAddShiftCollapsed, setIsAddShiftCollapsed] = useState<boolean>(true);
  const [editShift, setEditShift] = useState<Shift | null>(null);

  // Generate dates for the current week
  const getCurrentWeek = () => {
    const startOfWeek = moment().startOf('week');
    const dates: { [key: string]: any } = {};

    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.clone().add(i, 'days').format('YYYY-MM-DD');
      dates[date] = {
        marked: false,
        customStyles: {
          container: {
            backgroundColor: date === moment().format('YYYY-MM-DD') ? '#4CAF50' : 'white',
          },
          text: {
            color: date === moment().format('YYYY-MM-DD') ? 'white' : 'black',
          },
        },
      };
    }
    return dates;
  };

  useEffect(() => {
    setCurrentWeekDates(getCurrentWeek());
  }, []);

  const handleAddShift = () => {
    if (
      !newShift.day ||
      !newShift.startTime ||
      !newShift.endTime ||
      !newShift.maxPatients
    ) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required',
      });
      return;
    }
    // Add shift logic...
  };

  const handleDayPress = (day: any) => {
    setSelectedDay(day.dateString);
    setShiftStep(1); // Move to the first step
    setIsAddShiftCollapsed(false); // Automatically open add shift section
  };

  const toggleAddShift = () => {
    setIsAddShiftCollapsed(!isAddShiftCollapsed);
  };

  const handleShiftSubmit = () => {
    if (
      !newShift.name || // Validate shift name
      !newShift.startTime ||
      !newShift.endTime ||
      !newShift.maxPatients ||
      newShift.breaks.some(b => !b.start || !b.end)
    ) {
      Toast.show({
        type: 'error',
        text1: 'All fields are required',
      });
      return;
    }

    const shiftToAdd = { ...newShift, day: selectedDay! };

    createOrUpdateSchedule(shiftToAdd)
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Shift added successfully',
        });
        setShifts((prevShifts) => {
          const dayShifts = prevShifts[selectedDay!] || [];
          return {
            ...prevShifts,
            [selectedDay!]: [...dayShifts, shiftToAdd],
          };
        });
        setNewShift({
          name: '',
          day: '',
          startTime: '',
          endTime: '',
          maxPatients: 0,
          breaks: [],
          isRecurring: false,
        });
        fetchSchedule();
      })
      .catch((error) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to add shift',
          text2: error.message,
        });
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Your Schedule</Text>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsWeekView(!isWeekView)}
      >
        <Text style={styles.toggleButtonText}>
          {isWeekView ? 'Switch to Month View' : 'Switch to Week View'}
        </Text>
      </TouchableOpacity>

      {isWeekView ? (
        <Calendar
          onDayPress={handleDayPress}
          markedDates={currentWeekDates}
          hideExtraDays
          markingType="custom"
          theme={{
            todayTextColor: '#FF5722',
            arrowColor: '#4CAF50',
          }}
          style={{
            height: 100, // Restrict the calendar to a single line
          }}
        />
      ) : (
        <Calendar
          onDayPress={handleDayPress}
          markedDates={currentWeekDates}
          hideExtraDays
          markingType="custom"
          theme={{
            todayTextColor: '#FF5722',
            arrowColor: '#4CAF50',
          }}
          style={{
            height: 100, // Restrict the calendar to a single line
          }}
        />
      )}

      {shiftStep === 1 && selectedDay && (
        <Collapsible collapsed={false}>
          <ScrollView>
            <View style={styles.shiftForm}>
              <Text style={styles.formTitle}>Set Availability for {selectedDay}</Text>

              {/* Shift Name Input */}
              <TextInput
                placeholder="Shift Name"
                value={newShift.name}
                onChangeText={text => setNewShift({ ...newShift, name: text })}
                style={styles.input}
              />

              <DateTimePicker
                value={new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentTime = selectedDate || new Date();
                  setNewShift({
                    ...newShift,
                    startTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  });
                }}
                style={styles.timePicker}
              />

              <DateTimePicker
                value={new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentTime = selectedDate || new Date();
                  setNewShift({
                    ...newShift,
                    endTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  });
                }}
                style={styles.timePicker}
              />

              <TextInput
                placeholder="Max Patients"
                value={newShift.maxPatients.toString()}
                onChangeText={text => setNewShift({ ...newShift, maxPatients: Number(text) })}
                style={styles.input}
                keyboardType="numeric"
              />

              <View style={styles.isRecurringContainer}>
                <Text style={styles.isRecurringText}>Is Recurring?</Text>
                <TouchableOpacity
                  style={[
                    styles.recurringButton,
                    newShift.isRecurring ? styles.recurringActive : styles.recurringInactive,
                  ]}
                  onPress={() => setNewShift({ ...newShift, isRecurring: !newShift.isRecurring })}
                >
                  <Text style={styles.recurringButtonText}>
                    {newShift.isRecurring ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Breaks Section */}
              <View style={styles.breaksContainer}>
                <Text style={styles.breaksTitle}>Breaks</Text>
                {newShift.breaks.map((breakItem, index) => (
                  <View key={index} style={styles.breakItem}>
                    <DateTimePicker
                      value={breakItem.start ? new Date(`1970-01-01T${breakItem.start}:00`) : new Date()}
                      mode="time"
                      display="default"
                      onChange={(event, selectedDate) => {
                        const currentTime = selectedDate || new Date();
                        const updatedBreaks = [...newShift.breaks];
                        updatedBreaks[index].start = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        setNewShift({ ...newShift, breaks: updatedBreaks });
                      }}
                      style={styles.timePicker}
                    />
                    <DateTimePicker
                      value={breakItem.end ? new Date(`1970-01-01T${breakItem.end}:00`) : new Date()}
                      mode="time"
                      display="default"
                      onChange={(event, selectedDate) => {
                        const currentTime = selectedDate || new Date();
                        const updatedBreaks = [...newShift.breaks];
                        updatedBreaks[index].end = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        setNewShift({ ...newShift, breaks: updatedBreaks });
                      }}
                      style={styles.timePicker}
                    />
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addBreakButton}
                  onPress={() =>
                    setNewShift({
                      ...newShift,
                      breaks: [...newShift.breaks, { start: '', end: '' }],
                    })
                  }
                >
                  <Text style={styles.addBreakButtonText}>Add Break</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleShiftSubmit}>
                <Text style={styles.submitButtonText}>Save Availability</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Collapsible>
      )}

      {/* Display Shifts */}
      {selectedDay && shifts[selectedDay]?.map((shift, index) => (
        <View key={index} style={styles.shiftItem}>
          <Text style={styles.shiftText}>{`Name: ${shift.name}`}</Text>
          <Text style={styles.shiftText}>{`Time: ${shift.startTime} - ${shift.endTime}`}</Text>
          <Text style={styles.shiftText}>{`Max Patients: ${shift.maxPatients}`}</Text>
          <Text style={styles.shiftText}>{`Recurring: ${shift.isRecurring ? 'Yes' : 'No'}`}</Text>
          {shift.breaks.map((breakItem, breakIndex) => (
            <Text key={breakIndex} style={styles.shiftText}>{`Break ${breakIndex + 1}: ${breakItem.start} - ${breakItem.end}`}</Text>
          ))}
          {/* Add edit and delete options if needed */}
        </View>
      ))}

      {shiftStep === 2 && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>Shift added successfully!</Text>
          <TouchableOpacity
            style={styles.addAnotherButton}
            onPress={() => {
              setShiftStep(0);
              setSelectedDay(null);
              setNewShift({
                name: '',
                day: '',
                startTime: '',
                endTime: '',
                maxPatients: 0,
                breaks: [],
                isRecurring: false,
              });
            }}
          >
            <Text style={styles.addAnotherButtonText}>Add Another Shift</Text>
          </TouchableOpacity>
        </View>
      )}

      <Toast />
    </View>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  shiftForm: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  successMessage: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#388E3C',
    marginBottom: 10,
  },
  addAnotherButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  addAnotherButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  timePicker: {
    width: '100%',
    marginVertical: 10,
  },
  shiftItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  shiftText: {
    fontSize: 16,
    color: '#333',
  },
  isRecurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  isRecurringText: {
    fontSize: 16,
    marginRight: 10,
  },
  recurringButton: {
    padding: 10,
    borderRadius: 8,
  },
  recurringActive: {
    backgroundColor: '#4CAF50',
  },
  recurringInactive: {
    backgroundColor: '#ddd',
  },
  recurringButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  breaksContainer: {
    marginVertical: 10,
  },
  breaksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  breakItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  addBreakButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBreakButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});