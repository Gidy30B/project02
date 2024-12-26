import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import * as Notifications from 'expo-notifications';
import {
    setAppointments,
    setError,
    setLoading,
    setUpcomingAppointments,
    setRequestedAppointments,
    setCompletedAppointments,
    addNotification,
    selectAppointments,
} from '../app/(redux)/appointmentSlice';
import { selectUser } from '../app/(redux)/authSlice';

// Configure Notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const useAppointments = () => {
    const dispatch = useDispatch();
    const { appointments, loading, error } = useSelector(selectAppointments);
    const user = useSelector(selectUser);

    useEffect(() => {
        console.log('User:', user); // Log user information

        const fetchAppointments = async () => {
            if (!user || !user.userId) return;
    
            dispatch(setLoading(true));
            dispatch(setError(null));
    
            try {
                const userId = user.userId;
                const url = `https://medplus-health.onrender.com/api/appointments/user/${userId}`;
    
                const response = await fetch(url);
                const allData = await response.json();
                const appointmentsArray = Array.isArray(allData) ? allData : [];
    
                // Avoid redundant updates
                const currentAppointments = JSON.stringify(appointmentsArray);
                if (currentAppointments !== JSON.stringify(appointments)) {
                    dispatch(setAppointments(appointmentsArray));
    
                    const now = moment();
    
                    // Filter appointments
                    const upcomingAppointments = appointmentsArray.filter(
                        (appointment) =>
                            appointment.status === 'confirmed' &&
                            moment(appointment.date).isSameOrAfter(now, 'day')
                    );
    
                    const requestedAppointments = appointmentsArray.filter(
                        (appointment) => appointment.status === 'pending'
                    );
    
                    const completedAppointments = appointmentsArray.filter(
                        (appointment) => appointment.status === 'completed'
                    );
    
                    // Dispatch filtered data
                    dispatch(setUpcomingAppointments(upcomingAppointments));
                    dispatch(setRequestedAppointments(requestedAppointments));
                    dispatch(setCompletedAppointments(completedAppointments));
                }
            } catch (err) {
                console.error('Error fetching appointments:', err.message);
                dispatch(setError('Error fetching appointments'));
            } finally {
                dispatch(setLoading(false));
            }
        };
    
        fetchAppointments();
    }, [dispatch, user.userId]); // Added `user.userId` to the dependency array
    

    const confirmAppointment = async (appointmentId) => {
        try {
            const response = await fetch(
                `https://medplus-health.onrender.com/api/appointments/confirm/${appointmentId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                dispatch(setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment._id === appointmentId ? { ...appointment, status: 'confirmed' } : appointment
                    )
                ));
            } else {
                throw new Error('Failed to confirm appointment');
            }
        } catch (err) {
            console.error(err);
            dispatch(setError('Error confirming appointment'));
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const response = await fetch(
                `https://medplus-health.onrender.com/api/appointments/cancel/${appointmentId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                dispatch(setAppointments((prev) =>
                    prev.filter((appointment) => appointment._id !== appointmentId)
                ));
            } else {
                throw new Error('Failed to cancel appointment');
            }
        } catch (err) {
            console.error(err);
            dispatch(setError('Error cancelling appointment'));
        }
    };

    const transformAppointmentsToAgendaFormat = (appointments) => {
        const formattedAppointments = {};
      
        Object.keys(appointments).forEach((date) => {
          formattedAppointments[date] = appointments[date].map((appointment, index) => ({
            ...appointment,
            id: `${date}-${index}`,
          }));
        });
      
        return formattedAppointments;
      };

    return {
        appointments,
        loading,
        error,
        confirmAppointment,
        cancelAppointment,
        transformAppointmentsToAgendaFormat, // Expose the new function
    };
};

export default useAppointments;
