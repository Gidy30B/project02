import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; // Import Expo vector icons
import DatePicker from "react-datepicker"; // Import DatePicker component
import "react-datepicker/dist/react-datepicker.css"; // Import DatePicker styles

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

  // Array of modern background colors
  const bgColors = [
    "#e0f7fa",
    "#e8f5e9",
    "#fffde7",
    "#e3f2fd",
    "#fce4ec",
  ];

  return (
    <View style={{ padding: 16, backgroundColor: '#f5f5f5', flex: 1 }}>
      <View style={{ marginBottom: 16, backgroundColor: '#ffffff', padding: 16, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          className="date-picker"
          style={{ width: '100%', padding: 10, borderRadius: 8, borderColor: '#ddd', borderWidth: 1 }}
        />
      </View>
      {shiftsForSelectedDate.length === 0 ? (
        <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20 }}>
          No saved schedule available for the selected date.
        </Text>
      ) : (
        <ScrollView>
          {shiftsForSelectedDate.map((shift, shiftIndex) => (
            <View
              key={shiftIndex}
              style={{ padding: 16, backgroundColor: bgColors[shiftIndex % bgColors.length], marginBottom: 16, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 }}
            >
              {/* Date Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="calendar-today" size={20} style={{ marginRight: 8, color: '#00796b' }} /> 
                <Text style={{ fontWeight: 'bold', color: '#00796b' }}>{formattedDate}</Text>
              </View>
              {/* Shift Name and Time */}
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', color: '#00796b' }}>
                  {shift.shiftName}
                </Text>
                <Text style={{ color: '#00796b' }}>
                  {shift.startTime} - {shift.endTime}
                </Text>
              </View>
              {/* Horizontal Scrollable Slots */}
              <ScrollView horizontal>
                {shift.slots.map((slot, slotIndex) => (
                  <View
                    key={slotIndex}
                    style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4, marginRight: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ marginRight: 4, color: '#00796b' }}>{slot.startTime}</Text>
                      <Text style={{ marginHorizontal: 4, color: '#00796b' }}>-</Text>
                      <Text style={{ color: '#00796b' }}>{slot.endTime}</Text>
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

export default ScheduleComponent;