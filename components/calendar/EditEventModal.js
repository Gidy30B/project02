import React, { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Modal,
  View,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import ColorSelection from "./ColorSection";
import styles from './Style';
import { PickerIOS } from "@react-native-picker/picker";

const EditEventModal = ({ isVisible, event, onClose, onSave, isNew }) => {
  const [title, setTitle] = useState(event?.title || "");
  const [color, setColor] = useState(event?.color || "");
  const [summary, setSummary] = useState(event?.summary || "");
  const [startDate, setStartDate] = useState(event?.start ? new Date(event.start) : new Date());
  const [endDate, setEndDate] = useState(event?.end ? new Date(event.end) : new Date());
  const [isShift, setIsShift] = useState(false);
  const [shift, setShift] = useState({ name: '', startTime: '', endTime: '', breaks: [], consultationDuration: '' });
  const [newSchedule, setNewSchedule] = useState({ date: '', userId: '', shifts: [], startTime: '', endTime: '' });

  useEffect(() => {
    if (event) {
      console.log("Event data:", event);
      setTitle(event.title);
      setStartDate(event.start ? new Date(event.start) : new Date());
      setEndDate(event.end ? new Date(event.end) : new Date());
      setColor(event.color);
      setSummary(event.summary);
    }
  }, [event]);

  useEffect(() => {
    console.log("Modal visibility:", isVisible);
    console.log("Title:", title);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Shift:", shift);
    console.log("Color:", color);
  }, [isVisible, title, startDate, endDate, shift, color]);

  const handleSave = () => {
    onSave({
      ...event,
      title,
      start: startDate,
      end: endDate,
      color,
      summary,
      shifts: newSchedule.shifts,
    });
    onClose();
  };

  const onStartDateChange = (event, selectedDate) => {
    setStartDate(selectedDate);

    if (!hasAtLeastTenMinutesDifference(selectedDate, endDate)) {
      const newEndDate = new Date(selectedDate.getTime() + 60 * 60000); // Adding 1 hour
      setEndDate(newEndDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setEndDate(selectedDate);
  };

  function hasAtLeastTenMinutesDifference(date1, date2) {
    const tenMinutesInMilliseconds = 10 * 60 * 1000; // 10 minutes in milliseconds
    const differenceInMilliseconds = Math.abs(date1 - date2);
    return differenceInMilliseconds >= tenMinutesInMilliseconds;
  }

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  const handleAddShift = () => {
    setNewSchedule({ ...newSchedule, shifts: [...newSchedule.shifts, shift] });
    setShift({ name: '', startTime: '', endTime: '', breaks: [], consultationDuration: '' });
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              // Ensure editable is not set to false
              editable={true}
            />
            <Picker
              selectedValue={isShift}
              onValueChange={(itemValue) => setIsShift(itemValue)}
            >
              <Picker.Item label="Entire Day" value={false} />
              <Picker.Item label="Shifts" value={true} />
            </Picker>
            {isShift ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Shift Name"
                  value={shift.name}
                  onChangeText={text => setShift({ ...shift, name: text })}
                  editable={true}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Start Time (HH:mm)"
                  value={shift.startTime}
                  onChangeText={text => setShift({ ...shift, startTime: text })}
                  editable={true}
                />
                <TextInput
                  style={styles.input}
                  placeholder="End Time (HH:mm)"
                  value={shift.endTime}
                  onChangeText={text => setShift({ ...shift, endTime: text })}
                  editable={true}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Consultation Duration (minutes)"
                  value={shift.consultationDuration}
                  onChangeText={text => setShift({ ...shift, consultationDuration: text })}
                  editable={true}
                />
                <Text style={styles.label}>Color</Text>
                <TextInput
                  style={styles.input}
                  value={color}
                  onChangeText={setColor}
                  editable={true}
                />
                <ColorSelection eventColor={color} onClick={handleColorChange} />
                <TouchableOpacity style={styles.modalButton} onPress={handleAddShift}>
                  <Text style={styles.modalButtonText}>Add Shift</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Start Time (HH:mm)"
                  value={newSchedule.startTime}
                  onChangeText={text => setNewSchedule({ ...newSchedule, startTime: text })}
                  editable={true}
                />
                <TextInput
                  style={styles.input}
                  placeholder="End Time (HH:mm)"
                  value={newSchedule.endTime}
                  onChangeText={text => setNewSchedule({ ...newSchedule, endTime: text })}
                  editable={true}
                />
              </>
            )}
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default EditEventModal;