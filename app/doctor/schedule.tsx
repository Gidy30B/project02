import React, { useState, useEffect } from "react";
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
  }, [fetchSchedule]);

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

  // Save the schedule to the server
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
      setShifts([]); // Clear shifts after saving
    } catch (error) {
      alert("Error saving schedule.");
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
      return <p className="text-gray-500">No shifts added for this date yet.</p>;
    }

    return (
      <div className="mt-4 space-x-4 overflow-x-auto p-4 border-t bg-gray-50">
        <h3 className="font-semibold text-lg text-gray-700">Shifts for {selectedDate}</h3>
        <div className="flex space-x-4">
          {shiftsForSelectedDate.map((shift, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 p-4 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              <div className="font-semibold text-gray-800 cursor-pointer" onClick={() => toggleShiftSlots(index)}>
                {shift.name}
              </div>
              <div className="text-gray-600">
                {shift.startTime} - {shift.endTime}
              </div>

              {expandedShift === index && (
                <div className="mt-2 space-y-2">
                  {shift.slots.map((slot, idx) => (
                    <div key={idx} className="text-gray-500">
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

  // Handle editing schedule for a specific date
  const handleEditSchedule = (date: string) => {
    setSelectedDate(date);
    setShifts(schedule[date] || []);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Schedule Your Day</h2>
      </div>

      {/* Render saved schedule if available */}
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
  );
};

export default ScheduleShifts;
