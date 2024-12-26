import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // Import useSelector from react-redux
import { selectUser } from '../app/(redux)/authSlice'; // Import selectUser from userSlice

interface Slot {
  _id: string;
  date: string;
  startTime: string; // Changed from 'time' to 'startTime'
  endTime: string;   // Added 'endTime'
  isBooked: boolean;
  appointmentId?: string | null; // Added to align with backend
}

interface UseScheduleHook {
  schedule: Slot[];
  fetchSchedule: (professionalId: string) => Promise<void>;
  createOrUpdateSchedule: (professionalId: string, availability: Slot[]) => Promise<void>;
  createRecurringSlots: (professionalId: string, slot: Slot, recurrence: string) => Promise<void>;
  subscribeToScheduleUpdates: (professionalId: string) => void;
  updateSlot: (slotId: string, updates: Partial<Slot>) => Promise<void>;
  fetchScheduleForDate: (professionalId: string, date: string) => Promise<Slot[]>; // Added fetchScheduleForDate to the interface
}

const useSchedule = (): UseScheduleHook => {
  const [schedule, setSchedule] = useState<Slot[]>([]);
  const user = useSelector(selectUser); // Get user from Redux
  const professionalId = user.professional?._id; // Extract professionalId from user

  useEffect(() => {
    if (professionalId) {
      fetchSchedule(professionalId);
    }
  }, [professionalId]);

  // Directly fetch the schedule from the API
  const fetchSchedule = async (professionalId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${professionalId}`);
      if (response.status === 200 && response.data.slots) {
        setSchedule(response.data.slots);
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const createOrUpdateSchedule = async (professionalId: string, availability: Slot[]) => {
    try {
      const response = await axios.put(`https://medplus-health.onrender.com/api/schedule`, {
        professionalId,
        availability,
      });
      if (response.status === 200) {
        fetchSchedule(professionalId);
      } else {
        console.error('Failed to create or update schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating or updating schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const createRecurringSlots = async (professionalId: string, slots: Slot[], recurrence: string) => {
    try {
      const response = await axios.post(`https://medplus-health.onrender.com/api/schedule/createRecurringSlots`, {
        professionalId,
        slots,
        recurrence,
      });
      if (response.status === 200) {
        fetchSchedule(professionalId);
      } else {
        console.error('Failed to create recurring slots:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating recurring slots:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const subscribeToScheduleUpdates = (professionalId: string) => {
    const socket = new WebSocket(`wss://medplus-health.onrender.com/schedule/${professionalId}`);
    socket.onmessage = (event) => {
      const updatedSchedule = JSON.parse(event.data);
      setSchedule(updatedSchedule);
    };
  };

  const updateSlot = async (slotId: string, updates: Partial<Slot>) => {
    try {
      const updatedSchedule = schedule.map(slot =>
        slot._id === slotId ? { ...slot, ...updates } : slot
      );
      setSchedule(updatedSchedule);
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  const fetchScheduleForDate = async (professionalId: string, date: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${professionalId}/${date}`);
      if (response.status === 200 && response.data.slots) {
        return response.data.slots;
      } else {
        console.error('Failed to fetch schedule for date:', response.data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching schedule for date:', axios.isAxiosError(error) ? error.message : error);
      return [];
    }
  };

  return {
    schedule,
    fetchSchedule,
    createOrUpdateSchedule,
    createRecurringSlots,
    subscribeToScheduleUpdates,
    updateSlot,
    fetchScheduleForDate, // Added fetchScheduleForDate to the return object
  };
};

export default useSchedule;
