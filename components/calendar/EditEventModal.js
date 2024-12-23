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
import ColorSelection from "./ColorSection";
import styles from './Style';
import { useSelector } from 'react-redux';

const EditEventModal = ({ isVisible, event, onClose, onSave, isNew }) => {
  const userId = useSelector(state => state.user.id);
  const [title, setTitle] = useState(event?.title || "");
  const [color, setColor] = useState(event?.color || "");
  const [summary, setSummary] = useState(event?.summary || "");
  const [startDate, setStartDate] = useState(event?.start ? new Date(event.start) : new Date());
  const [endDate, setEndDate] = useState(event?.end ? new Date(event.end) : new Date());
  const [shift, setShift] = useState({ name: '', startTime: new Date(), endTime: new Date(), breaks: [], consultationDuration: '' });
  const [newSchedule, setNewSchedule] = useState({ userId: userId, shifts: [] });

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartDate(event.start ? new Date(event.start) : new Date());
      setEndDate(event.end ? new Date(event.end) : new Date());
      setColor(event.color);
      setSummary(event.summary);
    }
  }, [event]);

  const handleSave = () => {
    onSave({
      ...event,
      title,
      start: startDate,
      end: endDate,
      color,
      summary,
      shifts: newSchedule.shifts,
      userId: userId
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

  const onShiftStartTimeChange = (event, selectedTime) => {
    setShift({ ...shift, startTime: selectedTime });
  };

  const onShiftEndTimeChange = (event, selectedTime) => {
    setShift({ ...shift, endTime: selectedTime });
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
    setShift({ name: '', startTime: new Date(), endTime: new Date(), breaks: [], consultationDuration: '' });
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
            />
            <TextInput
              style={styles.input}
              placeholder="Shift Name"
              value={shift.name}
              onChangeText={text => setShift({ ...shift, name: text })}
            />
            <Text style={styles.label}>Start Time</Text>
            <DateTimePicker
              value={shift.startTime}
              mode="time"
              display="default"
              onChange={onShiftStartTimeChange}
            />
            <Text style={styles.label}>End Time</Text>
            <DateTimePicker
              value={shift.endTime}
              mode="time"
              display="default"
              onChange={onShiftEndTimeChange}
            />
            <TextInput
              style={styles.input}
              placeholder="Consultation Duration (minutes)"
              value={shift.consultationDuration}
              onChangeText={text => setShift({ ...shift, consultationDuration: text })}
            />
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
            />
            <ColorSelection eventColor={color} onClick={handleColorChange} />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddShift}>
              <Text style={styles.modalButtonText}>Add Shift</Text>
            </TouchableOpacity>
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
