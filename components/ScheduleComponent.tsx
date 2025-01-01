import React, { useState } from "react";
import { MaterialIcons } from '@expo/vector-icons'; // Import Expo vector icons
import DatePicker from "react-datepicker"; // Import DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles
import "./ScheduleComponent.css"; // Import custom styles

const ScheduleComponent = ({ schedule }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = formatDate(selectedDate);
  const shiftsForSelectedDate = schedule[formattedDate] || [];

  // Array of subtle background colors
  const bgColors = [
    "bg-indigo",
    "bg-green",
    "bg-yellow",
    "bg-blue",
    "bg-pink",
  ];

  return (
    <div className="schedule-container">
      
      <div className="date-picker-container">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
        />
      </div>
      {shiftsForSelectedDate.length === 0 ? (
        <p className="no-schedule">
          No saved schedule available for the selected date.
        </p>
      ) : (
        <div className="schedule-list">
          {shiftsForSelectedDate.map((shift, shiftIndex) => (
            <div
              key={shiftIndex}
              className={`shift-item ${bgColors[shiftIndex % bgColors.length]}`}
            >
              {/* Date Header */}
              <div className="schedule-date">
                <MaterialIcons name="calendar-today" size={20} className="calendar-icon" /> {formattedDate}
              </div>
              {/* Shift Name */}
              <div className="shift-name">
                {shift.shiftName}
              </div>
              {/* Horizontal Scrollable Slots */}
              <div className="slots-container">
                {shift.slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="slot-card"
                  >
                    <div className="slot-item-horizontal">
                      <span className="slot-time">{slot.startTime}</span>
                      <span className="slot-separator">-</span>
                      <span className="slot-time">{slot.endTime}</span>
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
