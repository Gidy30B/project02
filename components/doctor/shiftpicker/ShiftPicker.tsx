import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface ShiftPickerProps {
  predefinedShifts: { label: string; value: string }[];
  selectedPredefinedShift: string;
  shiftDetails: { name: string; startTime: string; endTime: string; breaks: string };
  handlePredefinedShiftChange: (value: string) => void;
  setShiftDetails: (details: { name: string; startTime: string; endTime: string; breaks: string }) => void;
}

const ShiftPicker: React.FC<ShiftPickerProps> = ({
  predefinedShifts,
  selectedPredefinedShift,
  shiftDetails,
  handlePredefinedShiftChange,
  setShiftDetails,
}) => {
  return (
    <View>
      <Picker
        selectedValue={selectedPredefinedShift}
        onValueChange={(itemValue) => handlePredefinedShiftChange(itemValue)}
        style={styles.picker}
        prompt="Select a Shift"
      >
        <Picker.Item label="Select a predefined shift..." value="" />
        {predefinedShifts.map((shift, index) => (
          <Picker.Item key={index} label={shift.label} value={shift.value} />
        ))}
      </Picker>
      {selectedPredefinedShift === 'Custom Shift' && (
        <TextInput
          style={styles.input}
          placeholder="Enter custom shift name"
          value={shiftDetails.name}
          onChangeText={(text) => setShiftDetails({ ...shiftDetails, name: text })}
        />
      )}
    </View>
  );
};

export default ShiftPicker;

const styles = StyleSheet.create({
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    marginBottom: 10,
    marginVertical: 10,
    fontSize: 16,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f0f2f5',
    marginBottom: 10,
    width: '100%',
  },
});