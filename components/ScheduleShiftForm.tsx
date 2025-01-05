import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput } from 'react-native'; // Import React Native components
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { Picker } from "@react-native-picker/picker";
import { format } from 'date-fns';

interface ScheduleShiftFormProps {
  onAddShift: () => void;
  onSaveSchedule: () => void;
  shifts: any[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  shiftData: { name: string; startTime: string; endTime: string };
  setShiftData: (data: { name: string; startTime: string; endTime: string }) => void;
  recurrence: string;
  setRecurrence: (recurrence: string) => void;
  consultationDuration: number;
  setConsultationDuration: (duration: number) => void;
  renderShiftPreview: () => JSX.Element;
}

const ScheduleShiftForm: React.FC<ScheduleShiftFormProps> = ({ onAddShift, onSaveSchedule, shifts, selectedDate, setSelectedDate, shiftData, setShiftData, recurrence, setRecurrence, consultationDuration, setConsultationDuration, renderShiftPreview }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(format(selectedDate, 'yyyy-MM-dd'));
    }
  };

  const handleStartTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setShiftData({ ...shiftData, startTime: format(selectedTime, 'HH:mm') });
    }
  };

  const handleEndTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setShiftData({ ...shiftData, endTime: format(selectedTime, 'HH:mm') });
    }
  };

  return (
    <View style={styles.formContainer}>
      {/* Schedule Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Recurrence</Text>
        <Picker
          selectedValue={recurrence}
          onValueChange={(itemValue) => setRecurrence(itemValue)}
          style={styles.select}
        >
          <Picker.Item label="Only for this day" value="none" />
          <Picker.Item label="Repeat every day" value="daily" />
          <Picker.Item label="Repeat weekly on this day" value="weekly" />
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Choose the date for your shifts</Text>
        <Button title={selectedDate || "Select Date"} onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Shift Input Form */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Shift Name</Text>
        <TextInput
          value={shiftData.name}
          onChangeText={(text) => setShiftData({ ...shiftData, name: text })}
          style={styles.input}
          placeholder="e.g., Morning Shift"
        />
      </View>

      <View style={styles.formGroupRow}>
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>Start Time</Text>
          <Button title={shiftData.startTime || "Select Start Time"} onPress={() => setShowStartTimePicker(true)} />
          {showStartTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleStartTimeChange}
            />
          )}
        </View>
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>End Time</Text>
          <Button title={shiftData.endTime || "Select End Time"} onPress={() => setShowEndTimePicker(true)} />
          {showEndTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              display="default"
              onChange={handleEndTimeChange}
            />
          )}
        </View>
      </View>

      {/* Add Shift Button */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={onAddShift}
          title="Add Shift"
          color="#4caf50"
        />
      </View>

      {/* Shift Preview */}
      {selectedDate && renderShiftPreview()}

      {/* Save Schedule Button */}
      <View style={styles.buttonContainer}>
        <Button
          onPress={onSaveSchedule}
          title="Save Schedule"
          color="#2196f3"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupRow: {
    flexDirection: 'row',
    gap: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  select: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ScheduleShiftForm;