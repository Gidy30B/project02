import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSchedule from "../../hooks/useSchedule";
import ScheduleComponent from "../../components/ScheduleComponent";
import ScheduleShiftForm from "../../components/ScheduleShiftForm";
import { StyleSheet, ScrollView } from 'react-native'; // Import ScrollView
import { useSelector } from 'react-redux'; // Import useSelector

interface Shift {
  name: string;
  startTime: string;
  endTime: string;
  date: string;
  slots: { startTime: string; endTime: string }[];
}

const ScheduleShifts: React.FC = () => {
  const { schedule, fetchSchedule } = useSchedule();
  const userId = useSelector((state) => state.auth.userId); // Get userId from Redux
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [shiftData, setShiftData] = useState<{ name: string; startTime: string; endTime: string }>({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [recurrence, setRecurrence] = useState<string>("none");
  const [consultationDuration, setConsultationDuration] = useState<number>(60);
  const [expandedShift, setExpandedShift] = useState<number | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSchedule(userId);
    }
  }, [fetchSchedule, userId]);

  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots: { startTime: string; endTime: string }[] = [];
    const start = new Date(`1970-01-01T${startTime}:00Z`);
    const end = new Date(`1970-01-01T${endTime}:00Z`);

    while (start < end) {
      const nextSlot = new Date(start);
      nextSlot.setMinutes(nextSlot.getMinutes() + duration + 10);

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

  const handleAddShift = () => {
    if (!shiftData.name || !shiftData.startTime || !shiftData.endTime || !selectedDate || !consultationDuration) {
      alert("Please fill out all fields!");
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

  const handleSaveSchedule = async () => {
    if (shifts.length === 0) {
      alert("Please add some shifts before saving!");
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
      alert("Your schedule has been saved successfully!");
      setShifts([]);
    } catch (error) {
      alert("Error saving schedule.");
    }
  };

  const toggleShiftSlots = (index: number) => {
    setExpandedShift(expandedShift === index ? null : index);
  };

  const renderShiftPreview = () => {
    const shiftsForSelectedDate = shifts.filter((shift) => shift.date === selectedDate);

    if (shiftsForSelectedDate.length === 0) {
      return <p className="no-shifts-message">No shifts added for this date yet.</p>;
    }

    return (
      <div className="shift-preview-container">
        <h3 className="preview-title">Shifts for {selectedDate}</h3>
        <div className="shifts-wrapper">
          {shiftsForSelectedDate.map((shift, index) => (
            <div key={index} className="shift-card">
              <div className="shift-header" onClick={() => toggleShiftSlots(index)}>
                {shift.name}
              </div>
              <div className="shift-details">
                {shift.startTime} - {shift.endTime}
              </div>

              {expandedShift === index && (
                <div className="shift-slots">
                  {shift.slots.map((slot, idx) => (
                    <div key={idx} className="slot">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleEditSchedule = (date: string) => {
    setSelectedDate(date);
    setShifts(schedule[date] || []);
  };

  return (
    <ScrollView style={styles.scrollView}> {/* Wrap in ScrollView */}
      <div style={styles.scheduleContainer}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Schedule Your Day</h2>
        </div>
        {schedule && Object.keys(schedule).length > 0 ? (
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
      </div>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scheduleContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2a2a2a',
    textAlign: 'center',
  },
});

export default ScheduleShifts;
