import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TextInput, Modal, Button, FlatList } from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { selectUser } from '../(redux)/authSlice';
import { addNotification, selectNotifications } from '../(redux)/appointmentSlice'; // Import Redux actions and selectors
import { useRouter } from 'expo-router';
import moment from 'moment';

import AsyncStorage from '@react-native-async-storage/async-storage';
import useSchedule from '../../hooks/useSchedule';
import { useRoute } from '@react-navigation/native';
import useSocketNotifications from '@/hooks/useSocketNotification';


const screenWidth = Dimensions.get('window').width;

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const route = useRoute();
  const { schedule, fetchSchedule } = useSchedule();
  const [tasks, setTasks] = useState<{ description: string, startTime: string, endTime: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications); // Get notifications from Redux state
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  useSocketNotifications(); // Call the hook to start listening for notifications

  useEffect(() => {
    (async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);
      if (storedUserId && storedUserId !== userIdRef.current) {
        userIdRef.current = storedUserId;
        setScheduleLoading(true);
        fetchSchedule(storedUserId)
          .catch((error) => {
            console.error('Failed to fetch schedule:', error);
            setScheduleError(error.message);
          })
          .finally(() => setScheduleLoading(false));
      } else {
        setScheduleLoading(false); // Ensure loading state is set to false if userId is not available
      }
    })();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          setTasks(parsedTasks);
        }
      } catch (e) {
        console.error('Failed to load tasks.', e);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (route.params?.showTaskModal) {
      setModalVisible(true);
    }
  }, [route.params]);

  useEffect(() => {
    setNewNotificationsCount(notifications.length); // Update the badge count
  }, [notifications]);

  useEffect(() => {
    console.log('Schedule data:', schedule); // Log the schedule data to examine its structure
  }, [schedule]);

  const handleViewPatient = (patientId: string, appointmentId: string) => {
    router.push(`/patient/${patientId}?appointmentId=${appointmentId}`);
  };

  const getNextTask = () => {
    const currentTime = moment();
    const upcomingTasks = tasks.filter(task => moment(task.time, 'HH:mm').isAfter(currentTime));
    upcomingTasks.sort((a, b) => moment(a.time, 'HH:mm').diff(moment(b.time, 'HH:mm')));
    return upcomingTasks[0];
  };

  const nextTask = getNextTask();

  if (scheduleLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (scheduleError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{scheduleError}</Text>
      </View>
    );
  }

  const renderOverviewCards = () => {
    const cardData = [
      { title: 'Total Appointments', count: 0, color: '#ff7f50' },
      { title: 'Upcoming', count: 0, color: '#4CAF50' },
      { title: 'Requested', count: 0, color: '#2196F3' },
      { title: 'Completed', count: 0, color: '#f44336' },
    ];

    return (
      <View style={styles.cardsContainer}>
        {cardData.map((card, index) => (
          <View key={index} style={[styles.card, { backgroundColor: card.color }]}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardCount}>{card.count}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOverviewList = () => {
    if (!schedule || typeof schedule !== 'object') {
      return <Text style={styles.noSlotsText}>No booked slots for today.</Text>;
    }

    const today = moment().format('YYYY-MM-DD');
    const todayShifts = schedule[today] || [];

    const todaySlots = todayShifts.flatMap(shift => shift.slots.filter(slot => slot.isBooked));

    return (
      <View style={styles.listContainer}>
        {todaySlots.length > 0 ? (
          todaySlots.map((slot, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>{`${slot.startTime} - ${slot.endTime}`}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSlotsText}>No booked slots for today.</Text>
        )}
      </View>
    );
  };

  const renderTaskItem = (task: { description: string, startTime: string, endTime: string }) => (
    <View style={styles.taskItem}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
      </View>
      <View style={styles.taskDetails}>
        <Text style={styles.taskText}>{task.description}</Text>
        <Text style={styles.taskTime}>{`${task.startTime} - ${task.endTime}`}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <>
        <View style={styles.overviewContainer}>
          <View style={styles.overviewHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.iconContainer}>
              <Icon name="calendar" size={24} color="#333" style={styles.icon} />
              {newNotificationsCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{newNotificationsCount}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.overviewCard}>
            <TouchableOpacity
              style={styles.overviewItem}
              onPress={() => router.push('/tasks')}
            >
              <Icon name="tasks" size={24} color="#ff7f50" style={styles.icon} />
              <Text style={styles.overviewLabel}>Tasks ({tasks.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
             style={styles.overviewItem}
             onPress={() => router.push('/income')}
            >
              <Icon name="money" size={24} color="#4CAF50" style={styles.icon} />
              <Text style={styles.overviewLabel}>Income</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overviewItem}>
              <Icon name="calendar" size={24} color="#f44336" style={styles.icon} />
              <Text style={styles.overviewLabel}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.overviewItem}
              onPress={() => router.push('/consultations')}
            >
              <Icon name="users" size={24} color="#2196F3" style={styles.icon} />
              <Text style={styles.overviewLabel}>Patients</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.analyticsContainer}>
          <Text style={styles.sectionTitle}>Appointments Overview</Text>
          {renderOverviewList()}
        </View>

        <View style={styles.tasksContainer}>
          <Text style={styles.sectionTitle}>Next Task</Text>
          {nextTask ? (
            renderTaskItem(nextTask)
          ) : (
            <Text style={styles.noTasksText}>No upcoming tasks.</Text>
          )}
        </View>
      </>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  overviewContainer: {
    marginBottom: 20,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: '#f44336',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  overviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  overviewItem: {
    alignItems: 'center',
    padding: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
  },
  analyticsContainer: {
    marginBottom: 20,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  tasksContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginTop: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff7f50',
    marginTop: 5,
  },
  line: {
    width: 2,
    height: 50,
    backgroundColor: '#ff7f50',
    marginTop: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  taskTime: {
    fontSize: 14,
    color: '#555',
  },
  noTasksText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  cardCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
});

export default DashboardScreen;

