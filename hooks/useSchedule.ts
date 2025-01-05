import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  appointmentId?: string | null;
}

interface UseScheduleHook {
  schedule: Slot[];
  fetchSchedule: (userId: string) => Promise<void>;
  createOrUpdateSchedule: (userId: string, availability: Slot[]) => Promise<void>;
  createRecurringSlots: (userId: string, slot: Slot[], recurrence: string) => Promise<void>;
  subscribeToScheduleUpdates: (userId: string) => void;
  updateSlot: (slotId: string, updates: Partial<Slot>) => Promise<void>;
  fetchScheduleForDate: (userId: string, date: string) => Promise<Slot[]>;
}

const useSchedule = (): UseScheduleHook => {
  const [schedule, setSchedule] = useState<Slot[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUserId && storedUserId !== userIdRef.current) {
        userIdRef.current = storedUserId;
        setUserId(storedUserId); // Update state only once
        await fetchSchedule(storedUserId);
      }
    })();
  }, []); // No dependencies to prevent continuous re-execution

  const fetchSchedule = async (userId: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${userId}`);
      if (response.status === 200 && response.data.availability) {
        setSchedule(response.data.availability);
        await AsyncStorage.setItem('schedule', JSON.stringify(response.data.availability)); // Store schedule in AsyncStorage
      } else {
        console.error('Failed to fetch schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const createOrUpdateSchedule = async (userId: string, availability: Slot[]) => {
    try {
      const response = await axios.put(`https://medplus-health.onrender.com/api/schedule`, {
        userId,
        availability,
      });
      if (response.status === 200) {
        await fetchSchedule(userId);
      } else {
        console.error('Failed to create or update schedule:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating or updating schedule:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const createRecurringSlots = async (userId: string, slots: Slot[], recurrence: string) => {
    try {
      const response = await axios.post(`https://medplus-health.onrender.com/api/schedule/createRecurringSlots`, {
        userId,
        slots,
        recurrence,
      });
      if (response.status === 200) {
        await fetchSchedule(userId);
      } else {
        console.error('Failed to create recurring slots:', response.data.message);
      }
    } catch (error) {
      console.error('Error creating recurring slots:', axios.isAxiosError(error) ? error.message : error);
    }
  };

  const subscribeToScheduleUpdates = (userId: string) => {
    const socket = new WebSocket(`wss://medplus-health.onrender.com/schedule/${userId}`);
    socket.onmessage = async (event) => {
      const updatedSchedule = JSON.parse(event.data);
      setSchedule(updatedSchedule);
      await AsyncStorage.setItem('schedule', JSON.stringify(updatedSchedule)); // Store updated schedule in AsyncStorage
    };
  };

  const updateSlot = async (slotId: string, updates: Partial<Slot>) => {
    try {
      const updatedSchedule = schedule.map((slot) =>
        slot._id === slotId ? { ...slot, ...updates } : slot
      );
      setSchedule(updatedSchedule);
      await AsyncStorage.setItem('schedule', JSON.stringify(updatedSchedule)); // Store updated schedule in AsyncStorage
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  const fetchScheduleForDate = async (userId: string, date: string) => {
    try {
      const response = await axios.get(`https://medplus-health.onrender.com/api/schedule/${userId}/${date}`);
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
    fetchScheduleForDate,
  };
};

export default useSchedule;
