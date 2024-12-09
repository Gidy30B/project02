import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeSelectorProps {
  startTime: Date | null;
  endTime: Date | null;
  breakTime: Date | null;
  showStartTimePicker: boolean;
  showEndTimePicker: boolean;
  showBreakTimePicker: boolean;
  onStartTimeChange: (event: any, selectedDate?: Date) => void;
  onEndTimeChange: (event: any, selectedDate?: Date) => void;
  onBreakTimeChange: (event: any, selectedDate?: Date) => void;
  setShowStartTimePicker: (show: boolean) => void;
  setShowEndTimePicker: (show: boolean) => void;
  setShowBreakTimePicker: (show: boolean) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  startTime,
  endTime,
  breakTime,
  showStartTimePicker,
  showEndTimePicker,
  showBreakTimePicker,
  onStartTimeChange,
  onEndTimeChange,
  onBreakTimeChange,
  setShowStartTimePicker,
  setShowEndTimePicker,
  setShowBreakTimePicker,
}) => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowStartTimePicker(true)}
        style={styles.timePickerButton}
      >
        <Text style={styles.timePickerText}>
          {startTime
            ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            : 'Work starts at ?'}
        </Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onStartTimeChange}
        />
      )}

      <TouchableOpacity
        onPress={() => setShowEndTimePicker(true)}
        style={styles.timePickerButton}
      >
        <Text style={styles.timePickerText}>
          {endTime
            ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            : 'Work ends at ?'}
        </Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onEndTimeChange}
        />
      )}

      <TouchableOpacity
        onPress={() => setShowBreakTimePicker(true)}
        style={styles.timePickerButton}
      >
        <Text style={styles.timePickerText}>
          {breakTime
            ? breakTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
            : 'Set Break Duration'}
        </Text>
      </TouchableOpacity>
      {showBreakTimePicker && (
        <DateTimePicker
          value={breakTime || new Date()}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={onBreakTimeChange}
        />
      )}
    </View>
  );
};

export default TimeSelector;

const styles = StyleSheet.create({
  timePickerButton: {
    padding: 10,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
  },
  timePickerText: {
    fontSize: 16,
    color: '#333',
  },
});