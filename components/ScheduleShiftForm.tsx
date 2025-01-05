import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'; 
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import DatePicker from "react-datepicker"; // Import DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

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
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setShiftData({ ...shiftData, startTime: selectedTime.toISOString().substr(11, 5) });
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setShiftData({ ...shiftData, endTime: selectedTime.toISOString().substr(11, 5) });
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
        <DatePicker
          selected={new Date(selectedDate)}
          onChange={(date: Date) => setSelectedDate(date.toISOString().split("T")[0])}
          style={styles.datePicker}
          aria-label="Select a date"
        />
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
          <TextInput
            value={shiftData.startTime}
            onFocus={() => setShowStartTimePicker(true)}
            style={styles.input}
            placeholder="Select Start Time"
          />
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
          <TextInput
            value={shiftData.endTime}
            onFocus={() => setShowEndTimePicker(true)}
            style={styles.input}
            placeholder="Select End Time"
          />
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
  datePicker: {
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