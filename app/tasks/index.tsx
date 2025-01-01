import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Modal,
  Button,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments';
import moment from 'moment';
import Colors from '../../components/Shared/Colors';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  description: string;
  time: string;
}

const TaskScreen: React.FC = () => {
  const navigation = useNavigation();
  const { schedule, fetchSchedule, loading, error } = useSchedule();
  const { appointments, loading: appointmentsLoading, error: appointmentsError } = useAppointments();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  useEffect(() => {
    const requestPermissions = async () => {
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          alert('Failed to get push token for notifications!');
        }
      } else {
        alert('Must use physical device for notifications');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (e) {
        console.error('Failed to load tasks from storage', e);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (Array.isArray(appointments)) {
      const currentTime = moment();

      const filteredAppointments = appointments.filter((app) =>
        moment(`${app.date} ${app.time}`, 'YYYY-MM-DD HH:mm').isAfter(currentTime)
      );

      const transformedTasks = filteredAppointments.map((app) => ({
        id: app._id,
        description: `Meet with ${app.patientId.name}`,
        time: app.time,
      }));

      setTasks(transformedTasks);
    }
  }, [appointments]);

  const scheduleNotification = async (task: Task) => {
    const taskTime = moment(task.time, 'HH:mm');
    const now = moment();

    if (taskTime.isAfter(now)) {
      const trigger = taskTime.diff(now, 'seconds');
      const reminderTrigger = taskTime.subtract(10, 'minutes').diff(now, 'seconds'); // 10 minutes before

      // Schedule the main notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: task.description,
        },
        trigger: { seconds: trigger },
      });

      // Schedule the reminder notification
      if (reminderTrigger > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Task Reminder',
            body: `Your task "${task.description}" is coming up in 10 minutes.`,
          },
          trigger: { seconds: reminderTrigger },
        });
      }
    }
  };

  const addTask = async () => {
    if (newTask.trim() && startTime.trim() && endTime.trim()) {
      const newTaskObj: Task = {
        id: Date.now().toString(),
        description: newTask.trim(),
        time: `${startTime.trim()} - ${endTime.trim()}`,
      };
      const updatedTasks = [...tasks, newTaskObj];
      setTasks(updatedTasks);
      await scheduleNotification(newTaskObj); // Schedule notification
      setNewTask('');
      setStartTime('');
      setEndTime('');
      setModalVisible(false);
      try {
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      } catch (e) {
        console.error('Failed to save task to storage', e);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={Colors.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>Your Tasks</Text>
      {tasks.length > 0 ? (
        <>
          <Text style={styles.taskListHeader}>Upcoming Tasks</Text>
          <FlatList
            data={tasks}
            renderItem={({ item, index }) => (
              <View style={styles.taskItem}>
                <View style={styles.timeline}>
                  <View style={styles.dot} />
                  {index < tasks.length - 1 && <View style={styles.line} />}
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTime}>{item.time}</Text>
                  <Text style={styles.taskDescription}>{item.description}</Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        </>
      ) : (
        <Text style={styles.noTasksText}>No upcoming tasks.</Text>
      )}
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
        <Text style={styles.addButtonText}>Add Task</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              placeholder="Enter task"
              value={newTask}
              onChangeText={setNewTask}
              style={styles.input}
            />
            <TextInput
              placeholder="Start Time (HH:mm)"
              value={startTime}
              onChangeText={setStartTime}
              style={styles.input}
            />
            <TextInput
              placeholder="End Time (HH:mm)"
              value={endTime}
              onChangeText={setEndTime}
              style={styles.input}
            />
            <Button title="Add Task" onPress={addTask} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="#888" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 16, textAlign: 'center' },
  taskListHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  taskItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  timeline: { width: 20, alignItems: 'center', marginRight: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff7f50', marginTop: 5 },
  line: { width: 2, height: 50, backgroundColor: '#ff7f50', marginTop: 2 },
  taskContent: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  taskTime: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  taskDescription: { fontSize: 16, color: '#333' },
  noTasksText: { fontSize: 16, color: '#777', textAlign: 'center', marginTop: 20 },
  addButton: { backgroundColor: Colors.primary, padding: 10, borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  backButton: { position: 'absolute', top: 40, left: 16, zIndex: 1 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default TaskScreen;
