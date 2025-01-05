import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons"; // Import Expo vector icons
import DatePicker from "react-datepicker"; // Import DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

const ScheduleComponent = ({ schedule }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => setSelectedDate(date);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDate(selectedDate);
  const shiftsForSelectedDate = schedule[formattedDate] || [];

  // Inline styles
  const styles = {
    container: {
      padding: "1rem",
      fontFamily: "Arial, sans-serif",
    },
    datePickerContainer: {
      marginBottom: "1rem",
    },
    datePicker: {
      width: "100%",
      padding: "0.5rem",
      fontSize: "1rem",
      borderRadius: "5px",
      border: "1px solid #ccc",
    },
    noSchedule: {
      textAlign: "center",
      color: "#666",
      fontSize: "1rem",
      marginTop: "1rem",
    },
    scheduleList: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    shiftItem: (bgColor) => ({
      backgroundColor: bgColor,
      padding: "1rem",
      borderRadius: "8px",
      color: "#fff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }),
    shiftHeader: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "0.5rem",
      fontSize: "1rem",
    },
    calendarIcon: {
      color: "#fff",
    },
    slotsContainer: {
      display: "flex",
      overflowX: "auto",
      gap: "0.5rem",
    },
    slotCard: {
      backgroundColor: "#fff",
      color: "#333",
      padding: "0.5rem 1rem",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      minWidth: "120px",
      textAlign: "center",
      display: "flex", // Added to ensure horizontal alignment
      justifyContent: "center", // Center the content horizontally
      alignItems: "center", // Center the content vertically
    },
    slotTime: {
      fontWeight: "bold",
    },
    slotSeparator: {
      margin: "0 0.25rem",
    },
  };

  // Array of subtle background colors
  const bgColors = ["#5C6BC0", "#66BB6A", "#FFA726", "#42A5F5", "#EC407A"];

  return (
    <div style={styles.container}>
      {/* Date Picker Section */}
      <div style={styles.datePickerContainer}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          style={styles.datePicker}
          aria-label="Select a date"
        />
      </div>

      {/* Shifts Display Section */}
      {shiftsForSelectedDate.length === 0 ? (
        <p style={styles.noSchedule}>
          No saved schedule available for the selected date.
        </p>
      ) : (
        <div style={styles.scheduleList}>
          {shiftsForSelectedDate.map((shift, shiftIndex) => (
            <div
              key={shiftIndex}
              style={styles.shiftItem(bgColors[shiftIndex % bgColors.length])}
            >
              {/* Date and Shift Name */}
              <div style={styles.shiftHeader}>
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  style={styles.calendarIcon}
                />
                <span>{formattedDate}</span>
                <span>{shift.shiftName}</span>
              </div>

              {/* Slots Section */}
              <div style={styles.slotsContainer}>
                {shift.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} style={styles.slotCard}>
                    <div>
                      <span style={styles.slotTime}>{slot.startTime}</span>
                      <span style={styles.slotSeparator}>-</span>
                      <span style={styles.slotTime}>{slot.endTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleComponent;
