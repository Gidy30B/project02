import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker"; // Expo-compatible DateTimePickerModal

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

const ScheduleShiftForm: React.FC<ScheduleShiftFormProps> = ({
  onAddShift,
  onSaveSchedule,
  shifts,
  selectedDate,
  setSelectedDate,
  shiftData,
  setShiftData,
  recurrence,
  setRecurrence,
  consultationDuration,
  setConsultationDuration,
  renderShiftPreview,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
    setDatePickerVisibility(false);
  };

  const handleConfirmStartTime = (time: Date) => {
    setShiftData({ ...shiftData, startTime: time.toISOString().substr(11, 5) });
    setStartTimePickerVisibility(false);
  };

  const handleConfirmEndTime = (time: Date) => {
    setShiftData({ ...shiftData, endTime: time.toISOString().substr(11, 5) });
    setEndTimePickerVisibility(false);
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
        <Button
          onPress={() => setDatePickerVisibility(true)}
          title={selectedDate ? selectedDate : "Select Date"}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={() => setDatePickerVisibility(false)}
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
            onFocus={() => setStartTimePickerVisibility(true)}
            style={styles.input}
            placeholder="Select Start Time"
          />
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleConfirmStartTime}
            onCancel={() => setStartTimePickerVisibility(false)}
          />
        </View>
        <View style={styles.formGroupHalf}>
          <Text style={styles.label}>End Time</Text>
          <TextInput
            value={shiftData.endTime}
            onFocus={() => setEndTimePickerVisibility(true)}
            style={styles.input}
            placeholder="Select End Time"
          />
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleConfirmEndTime}
            onCancel={() => setEndTimePickerVisibility(false)}
          />
        </View>
      </View>

      {/* Add Shift Button */}
      <View style={styles.buttonContainer}>
        <Button onPress={onAddShift} title="Add Shift" color="#4caf50" />
      </View>

      {/* Shift Preview */}
      {selectedDate && renderShiftPreview()}

      {/* Save Schedule Button */}
      <View style={styles.buttonContainer}>
        <Button onPress={onSaveSchedule} title="Save Schedule" color="#2196f3" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupRow: {
    flexDirection: "row",
    gap: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 16,
  },
  select: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ScheduleShiftForm;
