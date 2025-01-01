import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../app/(redux)/appointmentSlice'; // Import your Redux action
import socket from '../utils/socket'; // Import your socket instance

const useSocketNotifications = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for the 'appointment-booked' event
    socket.on('appointment-booked', (notification) => {
      dispatch(addNotification(notification)); // Add notification to Redux state
    });

    // Cleanup on unmount
    return () => {
      socket.off('appointment-booked');
    };
  }, [dispatch]);
};

export default useSocketNotifications;
