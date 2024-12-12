import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { Button, Snackbar, Card, TextInput, Dialog, Portal } from 'react-native-paper';
import axios from 'axios';
import EnhancedCalendar from '@/components/doctor/calendar/EnhancedCalendar';

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

interface ScheduleResponse {
  schedule: Shift[];
}

const timeToString = (time: Date): string => time.toISOString().split('T')[0];

const Schedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Shift[]>([]);
  const [shiftDetails, setShiftDetails] = useState<Shift>({
    name: '',
    startTime: '',
    endTime: '',
    consultationDuration: '',
    breaks: [],
  });
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [isSnackbarVisible, setIsSnackbarVisible] = useState<boolean>(false);
  const [currentBreak, setCurrentBreak] = useState<Break>({ start: '', end: '' });
  const [editingBreakIndex, setEditingBreakIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchSchedule = async () => {
      try {
        const response = await axios.get<ScheduleResponse>(`/api/schedule?date=${selectedDate}`);
        setSchedule(response.data.schedule || []);
      } catch (error) {
        console.error('Failed to fetch schedule:', error);
      }
    };

    fetchSchedule();
  }, [selectedDate]);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How would you like to schedule your day?</Text>
      <EnhancedCalendar onDayPress={(date) => setSelectedDate(timeToString(date))} />

      {selectedDate && (
        <View>
          <Text style={styles.sectionTitle}>Schedule for {selectedDate}</Text>

          {schedule.map((shift, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text style={styles.shiftTitle}>{shift.name}</Text>
                <Text>
                  {shift.startTime} - {shift.endTime} ({shift.consultationDuration} min consultation)
                </Text>
                {shift.breaks.length > 0 && (
                  <Text>Breaks: {shift.breaks.map((b, i) => `${b.start} - ${b.end}`).join(', ')}</Text>
                )}
              </Card.Content>
            </Card>
          ))}

          <Button onPress={() => setIsDialogVisible(true)} mode="contained" style={styles.button}>
            Add Shift
          </Button>

          <Button onPress={handleSaveSchedule} mode="contained" style={styles.saveButton}>
            Save Schedule
          </Button>
        </View>
      )}

      <Snackbar
        visible={isSnackbarVisible}
        onDismiss={() => setIsSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>{editingShiftIndex !== null ? 'Edit Shift' : 'Add Shift'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Shift Name"
              value={shiftDetails.name}
              onChangeText={(text) => setShiftDetails((prev) => ({ ...prev, name: text }))}
            />
            <TextInput
              label="Start Time"
              placeholder="HH:mm"
              value={shiftDetails.startTime}
              onChangeText={(text) => setShiftDetails((prev) => ({ ...prev, startTime: text }))}
            />
            <TextInput
              label="End Time"
              placeholder="HH:mm"
              value={shiftDetails.endTime}
              onChangeText={(text) => setShiftDetails((prev) => ({ ...prev, endTime: text }))}
            />
            <TextInput
              label="Consultation Duration (min)"
              keyboardType="numeric"
              value={shiftDetails.consultationDuration}
              onChangeText={(text) => setShiftDetails((prev) => ({ ...prev, consultationDuration: text }))}
            />

            <Text style={styles.sectionTitle}>Breaks</Text>
            {shiftDetails.breaks.map((b, i) => (
              <View key={i} style={styles.breakRow}>
                <Text>{b.start} - {b.end}</Text>
                <Button onPress={() => { setEditingBreakIndex(i); setCurrentBreak(b); }}>Edit</Button>
                <Button onPress={() => handleDeleteBreak(i)} color="red">Delete</Button>
              </View>
            ))}

            <TextInput
              label="Break Start Time"
              placeholder="HH:mm"
              value={currentBreak.start}
              onChangeText={(text) => setCurrentBreak((prev) => ({ ...prev, start: text }))}
            />
            <TextInput
              label="Break End Time"
              placeholder="HH:mm"
              value={currentBreak.end}
              onChangeText={(text) => setCurrentBreak((prev) => ({ ...prev, end: text }))}
            />
            <Button onPress={handleAddOrUpdateBreak} mode="outlined">
              {editingBreakIndex !== null ? 'Update Break' : 'Add Break'}
            </Button>
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
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 16, marginVertical: 8 },
  card: { marginBottom: 8 },
  shiftTitle: { fontSize: 16, fontWeight: 'bold' },
  button: { marginTop: 16 },
  saveButton: { marginTop: 16, backgroundColor: 'green' },
});

export default Schedule;
