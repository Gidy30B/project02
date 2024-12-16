import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
 
} from 'react-native';
import {
  Button,
  Snackbar,
  Card,
  Dialog,
  Portal,
} from 'react-native-paper';
import axios from 'axios';
import ClientHeader from '@/components/ClientHeader';
import EnhancedCalendar from '@/components/doctor/calendar/EnhancedCalendar';
import AgendaScreen from '@/components/doctor/calendar/EnhancedCalendar';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
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

const predeterminedShifts = ['Morning Shift', 'Afternoon Shift', 'Evening Shift', 'Night Shift'];

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

  const handleTimeChange = (time: Date | null, mode: 'startTime' | 'endTime' | 'breakStart' | 'breakEnd') => {
    if (!time) return setShowTimePicker((prev) => ({ ...prev, visible: false }));

    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (mode === 'breakStart' || mode === 'breakEnd') {
      setCurrentBreak((prev) => ({
        ...prev,
        [mode === 'breakStart' ? 'start' : 'end']: formattedTime,
      }));
    } else {
      setShiftDetails((prev) => ({
        ...prev,
        [mode]: formattedTime,
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
      // Update the items in AgendaScreen with the new schedule
      const newItems = { ...schedule };
      setItems(newItems);
    } catch (error) {
      console.error('Failed to save schedule:', error);
      setSnackbarMessage('Failed to save schedule. Please try again.');
      setIsSnackbarVisible(true);
    }
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setIsDialogVisible(true);
  };

  const handleShiftNameChange = (text: string) => {
    setShiftDetails((prev) => ({ ...prev, name: text }));
  };

  const renderItem = useCallback(({ item, index }) => (
    <Card key={index} style={styles.card}>
      <Card.Content>
        <Text style={styles.shiftTitle}>{item.name}</Text>
        <Text>{item.startTime} - {item.endTime}</Text>
        <Text>Consultation Duration: {item.consultationDuration} min</Text>
        {item.breaks.length > 0 && (
          <Text>Breaks: {item.breaks.map((b, i) => `${b.start} - ${b.end}`).join(', ')}</Text>
        )}
      </Card.Content>
    </Card>
  ), []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AgendaScreen onDayPress={handleDayPress} />
      {/* Schedule List */}
      <FlatList
        data={schedule}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
      {/* Add Shift Button */}
      <Button
        onPress={() => setIsDialogVisible(true)}
        mode="contained"
        style={styles.button}
      >
        schedule your Day
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
            <Text>Shift Name:</Text>
            <Picker
              selectedValue={shiftDetails.name}
              onValueChange={(itemValue) => handleShiftNameChange(itemValue)}
              style={styles.picker}
            >
              {predeterminedShifts.map((shift, index) => (
                <Picker.Item key={index} label={shift} value={shift} />
              ))}
              <Picker.Item label="Custom" value="" />
            </Picker>
            {shiftDetails.name === '' && (
              <TextInput
                placeholder="Enter Custom Shift Name"
                value={shiftDetails.name}
                onChangeText={handleShiftNameChange}
                style={styles.input}
              />
            )}
            <Text>Start Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'startTime', visible: true })
              }
            >
              {shiftDetails.startTime || 'Select Start Time'}
            </Button>
            <DateTimePickerModal
              isVisible={showTimePicker.visible && showTimePicker.mode === 'startTime'}
              mode="time"
              onConfirm={(time) => handleTimeChange(time, 'startTime')}
              onCancel={() => setShowTimePicker({ mode: 'startTime', visible: false })}
            />
            <Text>End Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'endTime', visible: true })
              }
            >
              {shiftDetails.endTime || 'Select End Time'}
            </Button>
            <DateTimePickerModal
              isVisible={showTimePicker.visible && showTimePicker.mode === 'endTime'}
              mode="time"
              onConfirm={(time) => handleTimeChange(time, 'endTime')}
              onCancel={() => setShowTimePicker({ mode: 'endTime', visible: false })}
            />
            <Text style={styles.consultationDurationTitle}>Consultation Duration:</Text>
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
            <DateTimePickerModal
              isVisible={showTimePicker.visible && showTimePicker.mode === 'breakStart'}
              mode="time"
              onConfirm={(time) => handleTimeChange(time, 'breakStart')}
              onCancel={() => setShowTimePicker({ mode: 'breakStart', visible: false })}
            />
            <Text>Break End Time:</Text>
            <Button
              mode="outlined"
              onPress={() =>
                setShowTimePicker({ mode: 'breakEnd', visible: true })
              }
            >
              {currentBreak.end || 'Select Break End Time'}
            </Button>
            <DateTimePickerModal
              isVisible={showTimePicker.visible && showTimePicker.mode === 'breakEnd'}
              mode="time"
              onConfirm={(time) => handleTimeChange(time, 'breakEnd')}
              onCancel={() => setShowTimePicker({ mode: 'breakEnd', visible: false })}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleAddOrUpdateShift}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  card: { marginVertical: 8, padding: 10 },
  shiftTitle: { fontSize: 16, fontWeight: 'bold' },
  input: { marginVertical: 8, padding: 10, borderRadius: 50 },
  button: { marginTop: 16, backgroundColor: '#6200EE' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  consultationDurationTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  saveButton: { marginTop: 16, backgroundColor: '#03DAC6' },
  picker: { marginVertical: 8 },
});

export default Schedule;
