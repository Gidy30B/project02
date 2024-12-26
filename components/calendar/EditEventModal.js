import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from 'react-redux';
import styles from "./Style";

const EditEventModal = ({ isVisible, onClose, onSave }) => {
  const userId = useSelector(state => state.user?.id || null);
  console.log('userId:', userId);
  const [step, setStep] = useState(1);
  const [shift, setShift] = useState({
    name: "",
    startTime: new Date(),
    endTime: new Date(),
    breaks: [],
    consultationDuration: "",
    date: new Date().toISOString().split('T')[0],
    timeSlots: [],
  });
  const [customShiftName, setCustomShiftName] = useState("");
  const [currentBreak, setCurrentBreak] = useState({ start: new Date(), end: new Date() });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showBreakStartPicker, setShowBreakStartPicker] = useState(false);
  const [showBreakEndPicker, setShowBreakEndPicker] = useState(false);
  const [allShifts, setAllShifts] = useState([]);

  const handleShiftSelection = (name) => {
    setShift({ ...shift, name });
    setStep(2);
  };

  const handleAddBreak = () => {
    setShift({
      ...shift,
      breaks: [...shift.breaks, { ...currentBreak }],
    });
    setCurrentBreak({ start: new Date(), end: new Date() }); // Reset break fields
  };

  const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime.getTime() + duration * 60000);
      if (slotEndTime > endTime) break;

      slots.push({
        start: currentTime.toISOString(),
        end: slotEndTime.toISOString(),
      });

      currentTime = slotEndTime;
    }

    return slots;
  };

  const handleSaveShift = () => {
    const timeSlots = generateTimeSlots(shift.startTime, shift.endTime, shift.consultationDuration);
    setAllShifts([...allShifts, { ...shift, timeSlots }]);
    setShift({
      name: "",
      startTime: new Date(),
      endTime: new Date(),
      breaks: [],
      consultationDuration: "",
      date: new Date().toISOString().split('T')[0],
      timeSlots: [],
    });
    setStep(1); // Reset to the first step for new shift
  };

  const handleFinalSave = async () => {
    console.log('All Shifts:', allShifts); // Log the state before sending the payload

    const payload = {
      professionalId: userId,
      availability: allShifts.reduce((acc, shift) => {
        const date = shift.date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push({
          name: shift.name,
          startTime: shift.startTime.toISOString(),
          endTime: shift.endTime.toISOString(),
          durationOfConsultation: shift.consultationDuration,
          breaks: shift.breaks.map(b => ({
            start: b.start.toISOString(),
            end: b.end.toISOString()
          })),
          timeSlots: shift.timeSlots,
        });
        return acc;
      }, {}),
      recurrence: 'None',
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://medplus-health.onrender.com/api/schedule', {
        method: 'Put',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Schedule saved successfully:', responseData);
      onSave(responseData);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }

    onClose();
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderShiftSelection = () => (
    <View>
      <Text style={styles.promptText}>Work Shifts</Text>
      <View style={styles.flexIconRow}>
        {[
          { name: "Morning Shift", icon: "sun", color: "#FFD700" },
          { name: "Afternoon Shift", icon: "cloud-sun", color: "#FFA500" },
          { name: "Evening Shift", icon: "moon", color: "#1E90FF" },
        ].map((shiftOption) => (
          <TouchableOpacity
            key={shiftOption.name}
            style={styles.iconButton}
            onPress={() => handleShiftSelection(shiftOption.name)}
          >
            <FontAwesome5
              name={shiftOption.icon}
              size={40}
              color={shiftOption.color}
            />
            <Text style={styles.iconText}>{shiftOption.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.promptText}>custom shift name</Text>
      <TextInput
        style={styles.input}
        placeholder="Shift Name"
        value={customShiftName}
        onChangeText={setCustomShiftName}
      />
      <TouchableOpacity
        style={styles.modalButton}
        onPress={() => handleShiftSelection(customShiftName)}
      >
        <Text style={styles.modalButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimePicker = (label, value, onChange, showPicker, setShowPicker) => (
    <View>
      <Text style={styles.promptText}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.inputContainer}
      >
        <Text style={styles.inputText}>
          {value.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="time"
          display="spinner"
          onChange={(event, selectedTime) => {
            setShowPicker(false);
            onChange(selectedTime || value);
          }}
        />
      )}
    </View>
  );

  const renderBreaks = () => (
    <View>
      <Text style={styles.promptText}>breaks</Text>
      {renderTimePicker("starts at", currentBreak.start, (time) => setCurrentBreak({ ...currentBreak, start: time }), showBreakStartPicker, setShowBreakStartPicker)}
      {renderTimePicker("ends at", currentBreak.end, (time) => setCurrentBreak({ ...currentBreak, end: time }), showBreakEndPicker, setShowBreakEndPicker)}
      <TouchableOpacity
        style={styles.addBreakButton}
        onPress={handleAddBreak}
      >
        <Text style={styles.addBreakButtonText}>Add Break</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsultationDuration = () => (
    <View>
      <Text style={styles.promptText}>Consultation duration (in minutes)</Text>
      <View style={styles.flexRow}>
        {["15", "30", "60"].map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.inputButton,
              shift.consultationDuration === duration && styles.activeInputButton,
            ]}
            onPress={() => setShift({ ...shift, consultationDuration: duration })}
          >
            <Text style={styles.inputButtonText}>{`${duration} Minutes`}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSaveOptions = () => (
    <View>
      
      <TouchableOpacity
        style={styles.modalButton}
        onPress={handleSaveShift}
      >
        <Text style={styles.modalButtonText}>Add Another Shift</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={handleFinalSave}
      >
        <Text style={styles.modalButtonText}>Save Schedule</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            {step === 1 && renderShiftSelection()}
            {step === 2 && (
              <View>
                {renderTimePicker("Work starts at:", shift.startTime, (time) => setShift({ ...shift, startTime: time }), showStartPicker, setShowStartPicker)}
                {renderTimePicker("Work ends at:", shift.endTime, (time) => setShift({ ...shift, endTime: time }), showEndPicker, setShowEndPicker)}
              </View>
            )}
            {step === 3 && renderBreaks()}
            {step === 4 && renderConsultationDuration()}
            {step === 5 && renderSaveOptions()}

            <View style={styles.navigationButtons}>
              {step > 1 && (
                <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
              )}
              {step < 5 && (
                <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default EditEventModal;
