import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import moment from 'moment';
import useSchedule from '../../hooks/useSchedule';
import useAppointments from '../../hooks/useAppointments'; 
import { selectUser } from '../store/userSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SlotItem from './SlotItem'; // Custom component for individual slots
import Colors from '@/components/Shared/Colors';


const ScheduleScreen: React.FC = () => {
  const user = useSelector(selectUser);
  const { schedule, fetchSchedule, createOrUpdateSchedule } = useSchedule();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<{ [key: string]: Slot[] }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.professional?._id) {
          await fetchSchedule(user.professional._id);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (!appointmentsLoading) {
      transformScheduleData();
    }
  }, [schedule, appointments]);

  const transformScheduleData = () => {
    const newItems: { [key: string]: Slot[] } = {};

    schedule.forEach((slot) => {
      const date = moment(slot.date).format('YYYY-MM-DD');
      if (!newItems[date]) {
        newItems[date] = [];
      }
      newItems[date].push({ ...slot });
    });

    setItems(newItems);
  };

  const renderSlotItem = ({ item }: { item: Slot }) => <SlotItem slot={item}   onSlotPress={handleSlotPress} />;

  const handleSlotPress = (slot: Slot) => {
    // Trigger modal or event for specific slot
    setIsModalVisible(true);
  };

  return loading ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <FlatList
  
      data={Object.entries(items).map(([key, slots]) => ({ key, slots }))}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => (
        <View>
          <Text style={styles.dateHeader}>{moment(item.key).format('DD MMM YYYY')}</Text>
          <FlatList
            data={item.slots}
            renderItem={renderSlotItem}
            keyExtractor={(slot) => slot._id}
          />
        </View>
      )}
    />
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5f0a4',
  
  },
  header: {
    marginBottom: 16,
    
  },
   dateSelectorContainer: {
    height: 80, 
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 99, 71, 0.4)', 
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4

  },
  dateButton: {
    padding: 10,
    
    marginRight: 8,
    
    
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateButton: {
    borderColor: Colors.primary,
  },
  dateText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: Colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: '#a3de83',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.primary,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 14,
    color: Colors.primary,
  },

  dateTitle: {
    fontSize: 18,
    color: Colors.primary,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  classItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#346473',
    marginBottom: 4, 
  },
  timelineLine: {
    width: 2,
    flex: 1, 
  },
  classContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: 8,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    backgroundColor: '#f7f39a',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  startTime: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  endTime: {
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  cardStatus: { 
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  loading: {
    marginTop: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  noAppointments: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  timeSlotsContainer: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  
  emptyContainer: {
    height: 200, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.primary,
  },
  card: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255, 99, 71, 0.4)', 
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#dce775',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  pickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 5,
    marginBottom: 10,
    
  },
  pickerButtonText: {
    color: Colors.primary,
  },
  createButton: {
    backgroundColor: Colors.gray,
   
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recurrenceLabel: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationLabel: {
    fontSize: 16,
    color: Colors.primary,
    marginRight: 10,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
});

export default ScheduleScreen;