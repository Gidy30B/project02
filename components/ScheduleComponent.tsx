import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from 'react-native'; // Import React Native components
import { MaterialIcons } from "@expo/vector-icons"; // Import Expo vector icons
import DatePicker from "react-datepicker"; // Import DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

interface Slot {
  startTime: string;
  endTime: string;
}

interface Shift {
  shiftName: string;
  slots: Slot[];
}

interface Schedule {
  [date: string]: Shift[];
}

interface ScheduleComponentProps {
  schedule: Schedule;
}

const ScheduleComponent: React.FC<ScheduleComponentProps> = ({ schedule }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date) => setSelectedDate(date);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDate(selectedDate);
  const shiftsForSelectedDate = schedule[formattedDate] || [];

  // Array of subtle background colors
  const bgColors = ["#5C6BC0", "#66BB6A", "#FFA726", "#42A5F5", "#EC407A"];

  return (
    <View style={styles.container}>
      {/* Date Picker Section */}
      <View style={styles.datePickerContainer}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          style={styles.datePicker}
          aria-label="Select a date"
        />
      </View>

      {/* Shifts Display Section */}
      {shiftsForSelectedDate.length === 0 ? (
        <Text style={styles.noSchedule}>
          No saved schedule available for the selected date.
        </Text>
      ) : (
        <ScrollView style={styles.scheduleList}>
          {shiftsForSelectedDate.map((shift, shiftIndex) => (
            <View
              key={shiftIndex}
              style={[styles.shiftItem, { backgroundColor: bgColors[shiftIndex % bgColors.length] }]}
            >
              {/* Date and Shift Name */}
              <View style={styles.shiftHeader}>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  style={styles.calendarIcon}
                />
                <Text>{formattedDate}</Text>
                <Text>{shift.shiftName}</Text>
              </View>

              {/* Slots Section */}
              <ScrollView horizontal style={styles.slotsContainer}>
                {shift.slots.map((slot, slotIndex) => (
                  <View key={slotIndex} style={styles.slotCard}>
                    <View>
                      <Text style={styles.slotTime}>{slot.startTime}</Text>
                      <Text style={styles.slotSeparator}>-</Text>
                      <Text style={styles.slotTime}>{slot.endTime}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    fontFamily: "Arial, sans-serif",
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePicker: {
    width: "100%",
    padding: 8,
    fontSize: 16,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  noSchedule: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
  scheduleList: {
    flexDirection: "column",
    gap: 16,
  },
  shiftItem: {
    padding: 16,
    borderRadius: 8,
    color: "#fff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  calendarIcon: {
    color: "#fff",
  },
  slotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  slotCard: {
    backgroundColor: "#fff",
    color: "#333",
    padding: 8,
    borderRadius: 5,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    minWidth: 120,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  slotTime: {
    fontWeight: "bold",
  },
  slotSeparator: {
    marginHorizontal: 4,
  },
});

export default ScheduleComponent;
