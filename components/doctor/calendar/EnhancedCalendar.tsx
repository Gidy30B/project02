import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { eachWeekOfInterval, subDays, addDays, eachDayOfInterval, format } from 'date-fns';
import PagerView from 'react-native-pager-view';

const dates = eachWeekOfInterval(
  {
    start: subDays(new Date(), 14),
    end: addDays(new Date(), 14),
  },
  { weekStartsOn: 1 }
).map((startOfWeek) =>
  eachDayOfInterval({
    start: startOfWeek,
    end: addDays(startOfWeek, 6),
  })
);

const EnhancedCalendar = ({ onDayPress }: { onDayPress: (date: Date) => void }) => {
  return (
    <PagerView style={styles.pagerView}>
      {dates.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekContainer}>
          <View style={styles.weekHeader}>
            {week.map((day, dayIndex) => (
              <Text key={dayIndex} style={styles.weekdayText}>
                {format(day, 'EEEEE')}
              </Text>
            ))}
          </View>
          <View style={styles.row}>
            {week.map((day, dayIndex) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <TouchableOpacity
                  key={dayIndex}
                  style={[styles.cell, isToday && styles.todayCell]}
                  onPress={() => onDayPress(day)}
                >
                  <Text style={[styles.dateText, isToday && styles.todayText]}>
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  weekContainer: {
    flex: 1,
    padding: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cell: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  todayCell: {
    backgroundColor: '#6200ea',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EnhancedCalendar;
