import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the clock icon

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
  consultationDuration: number;
  setConsultationDuration: (duration: number) => void;
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
  consultationDuration,
  setConsultationDuration,
  renderShiftPreview,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
    setDatePickerVisible(false);
  };

  const handleStartTimeConfirm = (time: Date) => {
    setShiftData({ ...shiftData, startTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    setStartTimePickerVisible(false);
  };

  const handleEndTimeConfirm = (time: Date) => {
    setShiftData({ ...shiftData, endTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    setEndTimePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Schedule Shifts</Text>
        <Ionicons name="time-outline" size={20} color="#555" style={styles.icon} />
      </View>

      {/* Consultation Duration */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Consultation Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={consultationDuration.toString()}
          onChangeText={(text) => {
            const duration = parseInt(text, 10);
            if (!isNaN(duration) && duration >= 30 && duration <= 120) {
              setConsultationDuration(duration);
            }
          }}
          keyboardType="numeric"
          placeholder="Enter duration"
        />
      </View>

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
        <TouchableOpacity onPress={() => setDatePickerVisible(true)} style={styles.input}>
          <Text>{selectedDate || "Select Date"}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
        />
      </View>

      {/* Shift Details */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Shift Name</Text>
        <TextInput
          style={styles.input}
          value={shiftData.name}
          onChangeText={(text) => setShiftData({ ...shiftData, name: text })}
          placeholder="Enter Shift Name"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfFieldContainer}>
          <Text style={styles.label}>Start Time</Text>
          <TouchableOpacity onPress={() => setStartTimePickerVisible(true)} style={styles.input}>
            <Text>{shiftData.startTime || "Select Start Time"}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={() => setStartTimePickerVisible(false)}
          />
        </View>

        <View style={styles.halfFieldContainer}>
          <Text style={styles.label}>End Time</Text>
          <TouchableOpacity onPress={() => setEndTimePickerVisible(true)} style={styles.input}>
            <Text>{shiftData.endTime || "Select End Time"}</Text>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setEndTimePickerVisible(false)}
          />
        </View>
      </View>

      <TouchableOpacity onPress={onAddShift} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Shift</Text>
      </TouchableOpacity>

      {selectedDate && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Shift Preview</Text>
          {renderShiftPreview()}
        </View>
      )}

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
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  icon: {
    marginLeft: 8,
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
