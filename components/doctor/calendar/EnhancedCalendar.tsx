import React from 'react';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { StyleSheet, View } from 'react-native';

const EnhancedCalendar = ({ onDayPress }: { onDayPress: (date: Date) => void }) => {
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => onDayPress(new Date(day.dateString))}
        markedDates={{
          [new Date().toISOString().split('T')[0]]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default EnhancedCalendar;
