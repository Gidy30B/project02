import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Platform, TextInput, ScrollView, Modal, TouchableOpacity, FlatList } from 'react-native';
import * as Calendar from 'expo-calendar';
import Toast from 'react-native-toast-message'; // Ensure Toast is imported
import { Ionicons } from '@expo/vector-icons'; // For accordion icons

export default function App() {
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [newShift, setNewShift] = useState({
    day: '',
    startTime: '',
    endTime: '',
    maxPatients: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const toggleDay = (day: string) => {
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const renderShift = (shift: any) => (
    <View key={shift._id} style={styles.shiftItem}>
      <Text style={styles.shiftText}>
        {shift.startTime} - {shift.endTime} | Max Patients: {shift.maxPatients}
      </Text>
    </View>
  );

  useEffect(() => {
    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        console.log('Here are all your calendars:');
        console.log({ calendars });
      }
    })();
  }, []);

  const handleAddShift = async () => {
    if (!newShift.startTime || !newShift.endTime || !newShift.maxPatients) {
      Toast.show({
        type: 'error',
        text1: 'Incomplete Data',
        text2: 'Please fill in all fields before saving.',
      });
      return;
    }

    try {
      if (!calendarId) {
        throw new Error('Calendar ID not available.');
      }

      const eventDetails = {
        title: 'Doctor Shift',
        startDate: new Date(`${newShift.day}T${newShift.startTime}`),
        endDate: new Date(`${newShift.day}T${newShift.endTime}`),
        notes: `Maximum Patients: ${newShift.maxPatients}`,
      };

      const eventId = await Calendar.createEventAsync(calendarId, eventDetails);

      Toast.show({
        type: 'success',
        text1: 'Shift Added',
        text2: `Shift added to calendar with ID: ${eventId}`,
      });
      setModalVisible(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add shift. Please try again.',
      });
    }
  };

  const fetchEvents = async () => {
    try {
      if (!calendarId) return;
      const events = await Calendar.getEventsAsync(
        [calendarId],
        new Date('2023-01-01'),
        new Date('2023-12-31')
      );
      console.log(events);
      
      // Organize events by day
      const shiftsByDay: { [key: string]: any[] } = {};
      events.forEach((event) => {
        const day = event.startDate.toISOString().split('T')[0];
        if (!shiftsByDay[day]) {
          shiftsByDay[day] = [];
        }
        shiftsByDay[day].push({
          _id: event.id,
          startTime: event.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: event.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          maxPatients: event.notes ? parseInt(event.notes.split(': ')[1]) : 0,
        });
      });
      // Update state or handle shiftsByDay as needed
      console.log(shiftsByDay);
      // Example: setShifts(shiftsByDay);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    if (calendarId) {
      fetchEvents();
    }
  }, [calendarId]);

  const onDayPress = (day: any) => {
    // Filter shifts for the selected day and update state as needed
    // Example: setSelectedDayShifts(filteredShifts);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doctor Schedule</Text>
      <Button title="Create a new calendar" onPress={createCalendar} />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>＋ Add Shift</Text>
      </TouchableOpacity>

      <FlatList
        data={daysOfWeek}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.accordionContainer}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => toggleDay(item)}
            >
              <Text style={styles.accordionTitle}>{item}</Text>
              <Ionicons
                name={
                  expandedDays.includes(item)
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={24}
                color="black"
              />
            </TouchableOpacity>
            {expandedDays.includes(item) && (
              <View style={styles.accordionContent}>
                {/* Render existing shifts for the day */}
                {/** Replace with actual shift data */}
                {/* ...existing shifts rendering... */}
                {/* Example Shift */}
                <View style={styles.shiftItem}>
                  <Text style={styles.shiftText}>09:00 AM - 01:00 PM | Max Patients: 10</Text>
                </View>
                <TouchableOpacity
                  style={styles.addShiftButton}
                  onPress={() => {
                    // Implement shift addition logic for the specific day
                  }}
                >
                  <Text style={styles.addShiftButtonText}>＋ Add Shift</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Shift</Text>
            <TextInput
              style={styles.input}
              placeholder="Day (YYYY-MM-DD)"
              value={newShift.day}
              onChangeText={(text) => setNewShift({ ...newShift, day: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Start Time (HH:MM)"
              value={newShift.startTime}
              onChangeText={(text) => setNewShift({ ...newShift, startTime: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="End Time (HH:MM)"
              value={newShift.endTime}
              onChangeText={(text) => setNewShift({ ...newShift, endTime: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Max Patients"
              value={newShift.maxPatients}
              onChangeText={(text) => setNewShift({ ...newShift, maxPatients: text })}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <Button title="Save" onPress={handleAddShift} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.shiftList}>
        {/** Render shifts here */}
        {/* ...existing code... */}
      </ScrollView>
    </View>
  );
}

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

async function createCalendar() {
  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getDefaultCalendarSource()
      : { isLocalAccount: true, name: 'Expo Calendar' };
  const newCalendarID = await Calendar.createCalendarAsync({
    title: 'Expo Calendar',
    color: 'blue',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'internalCalendarName',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  console.log(`Your new calendar ID is: ${newCalendarID}`);
  setCalendarId(newCalendarID);
  // You can now use calendarId to build your scheduling logic
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  shiftList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  accordionContainer: {
    width: '100%',
    marginVertical: 5,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  accordionContent: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    marginTop: 5,
  },
  shiftItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shiftText: {
    fontSize: 16,
  },
  addShiftButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addShiftButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
