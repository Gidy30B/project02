import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome5 } from "@expo/vector-icons";
import styles from "./Style";

const EditEventModal = ({ isVisible, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [shift, setShift] = useState({
    name: "",
    startTime: new Date(),
    endTime: new Date(),
    breaks: [],
    consultationDuration: "",
  });
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

  const handleSaveShift = () => {
    setAllShifts([...allShifts, shift]);
    setShift({
      name: "",
      startTime: new Date(),
      endTime: new Date(),
      breaks: [],
      consultationDuration: "",
    });
    setStep(1); // Reset to the first step for new shift
  };

  const handleFinalSave = () => {
    onSave(allShifts); // Pass the entire schedule back to the parent component
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            {step === 1 && (
              <View>
                <Text style={styles.promptText}>
                  Let’s set up your schedule. Select a shift:
                </Text>
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
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.promptText}>Work starts at:</Text>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  style={styles.inputContainer}
                >
                  <Text style={styles.inputText}>
                    {shift.startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={shift.startTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      setShowStartPicker(false);
                      setShift({ ...shift, startTime: selectedTime || shift.startTime });
                    }}
                  />
                )}
                <Text style={styles.promptText}>Work ends at:</Text>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  style={styles.inputContainer}
                >
                  <Text style={styles.inputText}>
                    {shift.endTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={shift.endTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      setShowEndPicker(false);
                      setShift({ ...shift, endTime: selectedTime || shift.endTime });
                    }}
                  />
                )}
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.promptText}>
                  Specify a break (optional):
                </Text>
                <Text style={styles.promptText}>Break starts at:</Text>
                <TouchableOpacity
                  onPress={() => setShowBreakStartPicker(true)}
                  style={styles.inputContainer}
                >
                  <Text style={styles.inputText}>
                    {currentBreak.start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                {showBreakStartPicker && (
                  <DateTimePicker
                    value={currentBreak.start}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      setShowBreakStartPicker(false);
                      setCurrentBreak({ ...currentBreak, start: selectedTime || currentBreak.start });
                    }}
                  />
                )}
                <Text style={styles.promptText}>Break ends at:</Text>
                <TouchableOpacity
                  onPress={() => setShowBreakEndPicker(true)}
                  style={styles.inputContainer}
                >
                  <Text style={styles.inputText}>
                    {currentBreak.end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
                {showBreakEndPicker && (
                  <DateTimePicker
                    value={currentBreak.end}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      setShowBreakEndPicker(false);
                      setCurrentBreak({ ...currentBreak, end: selectedTime || currentBreak.end });
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.addBreakButton}
                  onPress={handleAddBreak}
                >
                  <Text style={styles.addBreakButtonText}>Add Break</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 4 && (
              <View>
                <Text style={styles.promptText}>
                  How long should each consultation last? (in minutes)
                </Text>
                <View style={styles.flexRow}>
                  {["15", "30", "60"].map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.inputButton,
                        shift.consultationDuration === duration && styles.activeInputButton,
                      ]}
                      onPress={() =>
                        setShift({ ...shift, consultationDuration: duration })
                      }
                    >
                      <Text style={styles.inputButtonText}>{`${duration} Minutes`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {step === 5 && (
              <View>
                <Text style={styles.promptText}>
                  Would you like to save this schedule or add another shift?
                </Text>
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
            )}

            <View style={styles.indicatorsContainer}>
              {[1, 2, 3, 4, 5].map((indicatorStep) => (
                <TouchableOpacity
                  key={indicatorStep}
                  style={[
                    styles.indicator,
                    step === indicatorStep && styles.activeIndicator,
                  ]}
                  onPress={() => setStep(indicatorStep)}
                />
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default EditEventModal;
