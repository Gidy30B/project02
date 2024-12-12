import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Button,
  Snackbar,
  Card,
  Dialog,
  Portal,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';

// Types for the schedule data
interface Break {
  start: string;
  end: string;
}

interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  consultationDuration: string;
  breaks: Break[];
}

const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Shift[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [shiftDetails, setShiftDetails] = useState<Shift>({
    name: '',
    startTime: '',
    endTime: '',
    consultationDuration: '',
    breaks: [],
  });
  const [showTimePicker, setShowTimePicker] = useState<{
    mode: 'startTime' | 'endTime' | 'breakStart' | 'breakEnd';
    visible: boolean;
  }>({ mode: 'startTime', visible: false });

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState<boolean>(false);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [currentBreak, setCurrentBreak] = useState<Break>({ start: '', end: '' });
  const [editingBreakIndex, setEditingBreakIndex] = useState<number | null>(null);

  const handleAddOrUpdateShift = (): void => {
    if (!shiftDetails.name || !shiftDetails.startTime || !shiftDetails.endTime || !shiftDetails.consultationDuration) {
      setSnackbarMessage('Please fill out all fields for the shift.');
      setIsSnackbarVisible(true);
      return;
    }

    const newShift = { ...shiftDetails };

    setSchedule((prev) => {
      const updatedSchedule = [...prev];
      if (editingShiftIndex !== null) {
        updatedSchedule[editingShiftIndex] = newShift;
      } else {
        updatedSchedule.push(newShift);
      }
      return updatedSchedule;
    });

    setShiftDetails({ name: '', startTime: '', endTime: '', consultationDuration: '', breaks: [] });
    setEditingShiftIndex(null);
    setIsDialogVisible(false);
  };

  const handleAddOrUpdateBreak = (): void => {
    if (!currentBreak.start || !currentBreak.end) {
      setSnackbarMessage('Please fill out all fields for the break.');
      setIsSnackbarVisible(true);
      return;
    }

    const updatedBreaks = [...shiftDetails.breaks];
    if (editingBreakIndex !== null) {
      updatedBreaks[editingBreakIndex] = currentBreak;
    } else {
      updatedBreaks.push(currentBreak);
    }

    setShiftDetails((prev) => ({ ...prev, breaks: updatedBreaks }));
    setCurrentBreak({ start: '', end: '' });
    setEditingBreakIndex(null);
  };

  const handleDeleteBreak = (index: number): void => {
    setShiftDetails((prev) => ({
      ...prev,
      breaks: prev.breaks.filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (!selectedTime) return setShowTimePicker((prev) => ({ ...prev, visible: false }));

    const time = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (showTimePicker.mode === 'breakStart' || showTimePicker.mode === 'breakEnd') {
      setCurrentBreak((prev) => ({
        ...prev,
        [showTimePicker.mode === 'breakStart' ? 'start' : 'end']: time,
      }));
    } else {
      setShiftDetails((prev) => ({
        ...prev,
        [showTimePicker.mode]: time,
      }));
    }

    setShowTimePicker({ mode: 'startTime', visible: false });
  };

  const handleSaveSchedule = async (): Promise<void> => {
    if (!selectedDate) {
      setSnackbarMessage('No date selected.');
      setIsSnackbarVisible(true);
      return;
    }
  
    try {
      await axios.post('/api/schedule', { date: selectedDate, schedule });
      setSnackbarMessage('Schedule saved successfully!');
      setIsSnackbarVisible(true);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      setSnackbarMessage('Failed to save schedule. Please try again.');
      setIsSnackbarVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Schedule Your Day</Text>

      {/* Schedule Cards */}
      {schedule.map((shift, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <Text style={styles.shiftTitle}>{shift.name}</Text>
            <Text>{shift.startTime} - {shift.endTime}</Text>
            <Text>Consultation Duration: {shift.consultationDuration} min</Text>
            {shift.breaks.length > 0 && (
              <Text>Breaks: {shift.breaks.map((b, i) => `${b.start} - ${b.end}`).join(', ')}</Text>
            )}
          </Card.Content>
        </Card>
      ))}

      {/* Add Shift Button */}
      <Button
        onPress={() => setIsDialogVisible(true)}
        mode="contained"
        style={styles.button}
      >
        Add Shift
      </Button>

      {/* Save Schedule Button */}
      <Button
        onPress={handleSaveSchedule}
        mode="contained"
        style={styles.saveButton}
      >
        Save Schedule
      </Button>

      {/* Snackbar */}
      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      {/* Add/Edit Shift Dialog */}
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>{editingShiftIndex !== null ? 'Edit Shift' : 'Add Shift'}</Dialog.Title>
          <Dialog.Content>
            <Text>Name:</Text>
            <TextInput
              placeholder="Shift Name"
              value={shiftDetails.name}
              onChangeText={(text) =>
                setShiftDetails((prev) => ({ ...prev, name: text }))
              }
              style={styles.input}
            />
            <Text>Start Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'startTime', visible: true })
              }
            >
              {shiftDetails.startTime || 'Select Start Time'}
            </Button>

            <Text>End Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'endTime', visible: true })
              }
            >
              {shiftDetails.endTime || 'Select End Time'}
            </Button>

            <Text>Consultation Duration:</Text>
            <TextInput
              placeholder="Duration in Minutes"
              value={shiftDetails.consultationDuration}
              onChangeText={(text) =>
                setShiftDetails((prev) => ({
                  ...prev,
                  consultationDuration: text,
                }))
              }
              keyboardType="numeric"
              style={styles.input}
            />

            <Text style={styles.sectionTitle}>Breaks</Text>
            {shiftDetails.breaks.map((b, i) => (
              <View key={i} style={styles.breakRow}>
                <Text>{b.start} - {b.end}</Text>
                <Button onPress={() => { setEditingBreakIndex(i); setCurrentBreak(b); }}>Edit</Button>
                <Button onPress={() => handleDeleteBreak(i)} color="red">Delete</Button>
              </View>
            ))}

            <Text>Break Start Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'breakStart', visible: true })
              }
            >
              {currentBreak.start || 'Select Break Start Time'}
            </Button>

            <Text>Break End Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'breakEnd', visible: true })
              }
            >
              {currentBreak.end || 'Select Break End Time'}
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddOrUpdateShift}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Time Picker */}
      {showTimePicker.visible && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  card: { marginVertical: 8, padding: 10 },
  shiftTitle: { fontSize: 16, fontWeight: 'bold' },
  input: { marginVertical: 8 },
  button: { marginTop: 16, backgroundColor: '#6200EE' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  saveButton: { marginTop: 16, backgroundColor: '#03DAC6' },
});

export default Schedule;
