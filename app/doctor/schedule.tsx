import React, { useState, useEffect } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSchedule from "../../hooks/useSchedule"; // Import the custom hook for managing schedule data
import ScheduleComponent from "../../components/ScheduleComponent"; // Component to display the schedule
import ScheduleShiftForm from "../../components/ScheduleShiftForm"; // Component for adding/editing shifts

interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  date: string;
  slots: { startTime: string; endTime: string }[];
}

const ScheduleShifts: React.FC = () => {
  const { schedule, fetchSchedule } = useSchedule(); // Use the custom hook
  const [userId, setUserId] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]); 
  const [selectedDate, setSelectedDate] = useState<string>(""); 
  const [shiftData, setShiftData] = useState<{ name: string; startTime: string; endTime: string }>({ name: "", startTime: "", endTime: "" });
  const [recurrence, setRecurrence] = useState<string>("none");
  const [consultationDuration, setConsultationDuration] = useState<number>(60); 
  const [expandedShift, setExpandedShift] = useState<number | null>(null); 

  // Fetch user ID and schedule on component mount
  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);
        fetchSchedule(storedUserId); 
      }
    };
    getUserId();
  }, []);

  // Generate time slots based on start time, end time, and consultation duration
  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots: { startTime: string; endTime: string }[] = [];
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);

    while (start < end) {
      const nextSlot = new Date(start);
      nextSlot.setMinutes(nextSlot.getMinutes() + duration + 10); // Add waiting time

      if (nextSlot <= end) {
        slots.push({
          startTime: start.toISOString().substr(11, 5), 
          endTime: nextSlot.toISOString().substr(11, 5),
        });
      }
      start.setMinutes(start.getMinutes() + duration + 10);
    }
    return slots;
  };

  // Generate recurrence dates (daily, weekly, none)
  const generateRecurrenceDates = (startDate: string, recurrenceType: string) => {
    const dates: string[] = [];
    const start = new Date(startDate);

    if (recurrenceType === "daily") {
      for (let i = 0; i < 7; i++) {
        const newDate = new Date(start);
        newDate.setDate(start.getDate() + i);
        dates.push(newDate.toISOString().split("T")[0]);
      }
    } else if (recurrenceType === "weekly") {
      for (let i = 0; i < 4; i++) {
        const newDate = new Date(start);
        newDate.setDate(start.getDate() + i * 7);
        dates.push(newDate.toISOString().split("T")[0]);
      }
    } else {
      dates.push(startDate); 
    }

    return dates;
  };

  // Add a new shift
  const handleAddShift = () => {
    if (!shiftData.name || !shiftData.startTime || !shiftData.endTime || !selectedDate || !consultationDuration) {
      Alert.alert("Please fill out all fields!");
      return;
    }

    const recurrenceDates = generateRecurrenceDates(selectedDate, recurrence);
    const newShifts = recurrenceDates.map((date) => ({
      name: shiftData.name,
      startTime: shiftData.startTime,
      endTime: shiftData.endTime,
      date,
      slots: generateTimeSlots(shiftData.startTime, shiftData.endTime, consultationDuration),
    }));

    setShifts((prevShifts) => [...prevShifts, ...newShifts]);
    setShiftData({ name: "", startTime: "", endTime: "" });
  };

  // Save the schedule to the server
  const handleSaveSchedule = async () => {
    if (shifts.length === 0) {
      Alert.alert("Please add some shifts before saving!");
      return;
    }

    const formattedShifts = shifts.map((shift) => ({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      date: shift.date,
      slots: shift.slots,
    }));

    const payload = {
      professionalId: userId,
      availability: formattedShifts.reduce((acc: { [key: string]: any[] }, shift) => {
        const dayKey = shift.date;
        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }
        acc[dayKey].push({
          shiftName: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          slots: shift.slots,
        });
        return acc;
      }, {}),
      recurrence,
    };

    try {
      await axios.put("https://medplus-health.onrender.com/api/schedule", payload);
      Alert.alert("Your schedule has been saved successfully!");
      setShifts([]); // Clear shifts after saving
      fetchSchedule(userId); // Fetch the updated schedule
    } catch (error) {
      Alert.alert("Error saving schedule.");
    }
  };

  // Toggle shift slots expansion
  const toggleShiftSlots = (index: number) => {
    setExpandedShift(expandedShift === index ? null : index);
  };

  // Render shift preview for selected date
  const renderShiftPreview = () => {
    const shiftsForSelectedDate = shifts.filter((shift) => shift.date === selectedDate);

    if (shiftsForSelectedDate.length === 0) {
      return <Text style={{ color: 'gray' }}>No shifts added for this date yet.</Text>;
    }

    return (
      <View style={{ marginTop: 16, padding: 16, borderTopWidth: 1, backgroundColor: '#f0f0f0' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#4a4a4a' }}>Shifts for {selectedDate}</Text>
        <ScrollView horizontal>
          {shiftsForSelectedDate.map((shift, index) => (
            <View
              key={index}
              style={{ width: 192, padding: 16, backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d1d1', borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, marginRight: 16 }}
            >
              <Text style={{ fontWeight: 'bold', color: '#333' }} onPress={() => toggleShiftSlots(index)}>
                {shift.name}
              </Text>
              <Text style={{ color: '#666' }}>
                {shift.startTime} - {shift.endTime}
              </Text>

              {expandedShift === index && (
                <View style={{ marginTop: 8 }}>
                  {shift.slots.map((slot, idx) => (
                    <Text key={idx} style={{ color: '#999' }}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Handle editing schedule for a specific date
  const handleEditSchedule = (date: string) => {
    setSelectedDate(date);
    setShifts(schedule[date] || []);
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <ScrollView style={{ flex: 1, padding: 24 }}>
      {/* Top Section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Schedule Your Day</Text>
      </View>

      {/* Render saved schedule if available for today */}
      {schedule && schedule[getTodayDate()] ? (
        <ScheduleComponent schedule={schedule} onEditSchedule={handleEditSchedule} />
      ) : (
        <ScheduleShiftForm
          onAddShift={handleAddShift}
          onSaveSchedule={handleSaveSchedule}
          shifts={shifts}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          shiftData={shiftData}
          setShiftData={setShiftData}
          recurrence={recurrence}
          setRecurrence={setRecurrence}
          consultationDuration={consultationDuration}
          setConsultationDuration={setConsultationDuration}
          renderShiftPreview={renderShiftPreview}
        />
      )}
    </ScrollView>
  );
};

export default ScheduleShifts;