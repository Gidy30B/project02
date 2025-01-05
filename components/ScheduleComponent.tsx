import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Button } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars"; // Import Calendar component
import { format } from "date-fns"; // For date formatting
import ScheduleShiftForm from "./ScheduleShiftForm"; // Import ScheduleShiftForm component

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
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [showForm, setShowForm] = useState<boolean>(false); // State to toggle form visibility

  const shiftsForSelectedDate = schedule[selectedDate] || [];

  const bgColors = ["#5C6BC0", "#66BB6A", "#FFA726", "#42A5F5", "#EC407A"];

  // Helper function to get the week range
  const getWeekRange = (date: Date) => {
    const startOfWeek = format(date, "yyyy-MM-dd"); // Start of the week
    const endOfWeek = format(
      new Date(date.setDate(date.getDate() + 6)), // End of the week
      "yyyy-MM-dd"
    );
    return { startOfWeek, endOfWeek };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(new Date());

  return (
    <View style={styles.container}>
      {/* Week Calendar Section */}
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          setShowForm(true); // Show form when a date is selected
        }}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#66BB6A" },
        }}
        markingType={"period"}
        theme={{
          todayTextColor: "#FFA726",
          arrowColor: "#42A5F5",
        }}
        // Customize calendar to show only the week view
        firstDay={1} // Start the week from Monday
        hideExtraDays={true} // Hide days from the next month that are not in the week
        markedDates={{
          [startOfWeek]: { startingDay: true, color: "#66BB6A", textColor: "#fff" },
          [endOfWeek]: { endingDay: true, color: "#66BB6A", textColor: "#fff" },
        }}
      />

      {/* Render ScheduleShiftForm if showForm is true */}
      {showForm && (
        <ScheduleShiftForm
          onAddShift={() => {}}
          onSaveSchedule={() => {}}
          shifts={shiftsForSelectedDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          shiftData={{ name: "", startTime: "", endTime: "" }}
          setShiftData={() => {}}
          recurrence="none"
          setRecurrence={() => {}}
          consultationDuration={0}
          setConsultationDuration={() => {}}
          renderShiftPreview={() => <View />}
        />
      )}

      {/* Shifts Display Section */}
      {shiftsForSelectedDate.length > 0 && (
        <ScrollView style={styles.scheduleList}>
          {shiftsForSelectedDate.map((shift, shiftIndex) => (
            <View
              key={shiftIndex}
              style={[
                styles.shiftItem,
                { backgroundColor: bgColors[shiftIndex % bgColors.length] },
              ]}
            >
              <View style={styles.shiftHeader}>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  style={styles.calendarIcon}
                />
                <Text style={styles.shiftDate}>{selectedDate}</Text>
                <Text style={styles.shiftName}>{shift.shiftName}</Text>
              </View>

              {/* Slots Section */}
              <ScrollView horizontal style={styles.slotsContainer}>
                {shift.slots.map((slot, slotIndex) => (
                  <View key={slotIndex} style={styles.slotCard}>
                    <Text style={styles.slotTime}>{slot.startTime}</Text>
                    <Text style={styles.slotSeparator}>-</Text>
                    <Text style={styles.slotTime}>{slot.endTime}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}

      {shiftsForSelectedDate.length === 0 && (
        <Text style={styles.noSchedule}>
          No saved schedule available for the selected date.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  noSchedule: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
  scheduleList: {
    marginTop: 16,
  },
  shiftItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  shiftHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  calendarIcon: {
    marginRight: 8,
    color: "#fff",
  },
  shiftDate: {
    fontWeight: "bold",
    marginRight: 8,
  },
  shiftName: {
    color: "#fff",
  },
  slotsContainer: {
    flexDirection: "row",
  },
  slotCard: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // Added to align items horizontally
  },
  slotTime: {
    fontWeight: "bold",
  },
  slotSeparator: {
    marginHorizontal: 4,
  },
});

export default ScheduleComponent;
