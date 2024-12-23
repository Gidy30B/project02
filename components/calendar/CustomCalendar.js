import React, { useState } from "react";
import { Text, TouchableOpacity, View, Dimensions } from "react-native";
import { Agenda } from "react-native-calendars";
import EditEventModal from "./EditEventModal";
import styles from './Style';

const RenderItem = React.memo(({ item }) => (
  <TouchableOpacity style={styles.agendaItem}>
    <Text style={styles.agendaItemText}>{item.name}</Text>
  </TouchableOpacity>
));

export default function CustomCalendar({ onDayPress }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  const handleDayPress = (day) => {
    console.log("Day pressed:", day);
    setSelectedDate(day.dateString);
    setCurrentEvent({ date: day.dateString, start: new Date(), end: new Date() });
    setModalVisible(true);
    if (onDayPress) {
      onDayPress(day);
    }
  };

  const handleSave = (event) => {
    console.log("Event saved:", event);
    setModalVisible(false);
  };

  return (
    <View style={styles.calendarContainer}>
      <Agenda
        selected={selectedDate}
        items={{
          "2024-06-12": [
            { name: "Cycling" },
            { name: "Walking" },
            { name: "Running" },
          ],
          "2024-06-14": [{ name: "Writing" }],
        }}
        renderItem={(item, isFirst) => <RenderItem item={item} />}
        onDayPress={handleDayPress}
        style={styles.agenda}
      />
      <EditEventModal
        isVisible={isModalVisible}
        event={currentEvent}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        isNew={true}
      />
    </View>
  );
}