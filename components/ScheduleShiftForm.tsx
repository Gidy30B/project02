import React from "react";
import { View, Text, TextInput, TouchableOpacity, Picker, StyleSheet } from "react-native";

interface ShiftData {
  name: string;
  startTime: string;
  endTime: string;
}

interface ScheduleShiftFormProps {
  onAddShift: () => void;
  onSaveSchedule: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  shiftData: ShiftData;
  setShiftData: (data: ShiftData) => void;
  recurrence: string;
  setRecurrence: (recurrence: string) => void;
  renderShiftPreview: () => React.ReactNode;
}

const ScheduleShiftForm: React.FC<ScheduleShiftFormProps> = ({
  onAddShift,
  onSaveSchedule,
  selectedDate,
  setSelectedDate,
  shiftData,
  setShiftData,
  recurrence,
  setRecurrence,
  renderShiftPreview,
}) => {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Schedule Shifts</Text>

      {/* Recurrence Selector */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Recurrence</Text>
        <Picker
          selectedValue={recurrence}
          onValueChange={(itemValue) => setRecurrence(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Only for this day" value="none" />
          <Picker.Item label="Repeat every day" value="daily" />
          <Picker.Item label="Repeat weekly on this day" value="weekly" />
        </Picker>
      </View>

      {/* Date Picker */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Choose the Date for Your Shifts</Text>
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />
      </View>

      {/* Shift Details */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Shift Name</Text>
        <TextInput
          value={shiftData.name}
          onChangeText={(text) => setShiftData({ ...shiftData, name: text })}
          placeholder="e.g., Morning Shift"
          style={styles.input}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfFieldContainer}>
          <Text style={styles.label}>Start Time</Text>
          <TextInput
            value={shiftData.startTime}
            onChangeText={(text) => setShiftData({ ...shiftData, startTime: text })}
            placeholder="HH:MM"
            style={styles.input}
          />
        </View>
        <View style={styles.halfFieldContainer}>
          <Text style={styles.label}>End Time</Text>
          <TextInput
            value={shiftData.endTime}
            onChangeText={(text) => setShiftData({ ...shiftData, endTime: text })}
            placeholder="HH:MM"
            style={styles.input}
          />
        </View>
      </View>

      {/* Add Shift Button */}
      <TouchableOpacity onPress={onAddShift} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Shift</Text>
      </TouchableOpacity>

      {/* Shift Preview */}
      {selectedDate && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Shift Preview</Text>
          {renderShiftPreview()}
        </View>
      )}

      {/* Save Schedule Button */}
      <TouchableOpacity onPress={onSaveSchedule} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Schedule</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  halfFieldContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  previewContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: "#28A745",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScheduleShiftForm;
