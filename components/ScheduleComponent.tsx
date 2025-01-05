import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars"; // Import Calendar component
import { format } from "date-fns"; // For date formatting

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

  const shiftsForSelectedDate = schedule[selectedDate] || [];

  const bgColors = ["#5C6BC0", "#66BB6A", "#FFA726", "#42A5F5", "#EC407A"];

  return (
    <View style={styles.container}>
      {/* Calendar Section */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#66BB6A" },
        }}
        theme={{
          todayTextColor: "#FFA726",
          arrowColor: "#42A5F5",
        }}
      />

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
  },
  slotTime: {
    fontWeight: "bold",
  },
  slotSeparator: {
    marginHorizontal: 4,
  },
});

export default ScheduleComponent;
