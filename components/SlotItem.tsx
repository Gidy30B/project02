import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, Platform, Animated, Easing } from 'react-native';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

interface SlotItemProps {
  slots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    isBooked: boolean;
    _id: string;
    [key: string]: any;
  }> | undefined;
  onSlotPress: (slot: any) => void;
}

const SlotItem: React.FC<SlotItemProps> = ({ slots = [], onSlotPress }) => {
  const currentDate = moment().startOf('day');
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSlotDateTime, setNewSlotDateTime] = useState<Date | null>(null);
  const [slotDuration, setSlotDuration] = useState<number>(60);
  const [isDateTimePickerVisible, setDateTimePickerVisibility] = useState(false);
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'monthly'>('none');
  const [modalAnimation] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateDatesForCurrentMonth = () => {
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');
    const dates: moment.Moment[] = [];

    for (let date = startOfMonth; date.isBefore(endOfMonth, 'day'); date.add(1, 'day')) {
      dates.push(date.clone());
    }

    return dates;
  };

  const groupSlotsByDate = (slots: any[]) => {
    const groupedSlots: { [key: string]: any[] } = {};

    slots.forEach((slot) => {
      const slotDate = moment(slot.date).startOf('day');

      if (slotDate.isAfter(currentDate) || slotDate.isSame(currentDate)) {
        const dateKey = slotDate.format('YYYY-MM-DD');
        if (!groupedSlots[dateKey]) {
          groupedSlots[dateKey] = [];
        }

        const uniqueSlotKey = `${dateKey}_${slot.startTime}`;
        if (!groupedSlots[dateKey].some((existingSlot) => existingSlot.uniqueKey === uniqueSlotKey)) {
          slot.uniqueKey = uniqueSlotKey;
          groupedSlots[dateKey].push(slot);
        }
      }
    });

    return groupedSlots;
  };

  const groupedSlots = groupSlotsByDate(slots);

  const handleDateSelect = (date: moment.Moment) => {
    setSelectedDate(date);
  };

  const renderDateItem = ({ item }: { item: moment.Moment }) => {
    const isCurrentDate = item.isSame(currentDate, 'day');
    const dateFormatted = item.format('ddd, DD');

    return (
      <TouchableOpacity
        onPress={() => handleDateSelect(item)}
        style={[
          styles.dateButton,
          selectedDate.isSame(item, 'day') ? styles.selectedDateButton : null,
        ]}
      >
        <Text
          style={[
            styles.dateText,
            selectedDate.isSame(item, 'day') ? styles.selectedDateText : null,
          ]}
        >
          {dateFormatted}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSlotItem = ({ item }: { item: any }) => {
    const { startTime, endTime, isBooked } = item;

    return (
      <TouchableOpacity
        onPress={() => onSlotPress(item)}
        style={[
          styles.slotCard,
          isBooked ? styles.bookedSlot : styles.availableSlot,
        ]}
      >
        <Text style={styles.slotText}>
          {startTime} - {endTime}
        </Text>
      </TouchableOpacity>
    );
  };

  const showDateTimePicker = () => {
    setDateTimePickerVisibility(true);
  };

  const hideDateTimePicker = () => {
    setDateTimePickerVisibility(false);
  };

  const handleConfirmDateTime = (dateTime: Date) => {
    setNewSlotDateTime(dateTime);
    hideDateTimePicker();
  };

  const handleCreateSlot = async () => {
    if (!newSlotDateTime) {
      setErrorMessage('Date and time are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const start = moment(newSlotDateTime);
    const end = start.clone().add(slotDuration, 'minutes');

    const availability = [{
      date: start.format('YYYY-MM-DD'),
      startTime: start.format('HH:mm'),
      endTime: end.format('HH:mm'),
      isBooked: false,
      _id: '',
    }];

    try {
      await axios.post('https://medplus-health.onrender.com/api/schedule/createSlots', {
        slots: availability,
        recurrence,
      });

      setIsModalVisible(false);
      setNewSlotDateTime(null);
      setRecurrence('none');
      setSlotDuration(60);
    } catch (error) {
      setErrorMessage('Failed to create slot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => setIsModalVisible(false));
  };

  const modalTranslateY = modalAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <View style={styles.container}>
      <View style={styles.dateSelectorContainer}>
        <FlatList
          horizontal
          data={generateDatesForCurrentMonth()}
          keyExtractor={(item) => item.toISOString()}
          renderItem={renderDateItem}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.slotContainer}>
        <Text style={styles.selectedDateText}>
          Slots for {selectedDate.format('MMMM D, YYYY')}
        </Text>

        {groupedSlots[selectedDate.format('YYYY-MM-DD')]?.length > 0 ? (
          <FlatList
            data={groupedSlots[selectedDate.format('YYYY-MM-DD')]}
            renderItem={renderSlotItem}
            keyExtractor={(item) => item.uniqueKey || item._id}
          />
        ) : (
          <Text style={styles.noSlotsText}>No available slots for this date.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Create Slot</Text>
      </TouchableOpacity>

      <Modal visible={isModalVisible} transparent={true} animationType="none">
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: modalTranslateY }] }]}>
            <Text style={styles.modalTitle}>Create New Slot</Text>

            <TouchableOpacity onPress={showDateTimePicker} style={styles.pickerButton}>
              <Text style={styles.pickerButtonText}>
                {newSlotDateTime ? moment(newSlotDateTime).format('YYYY-MM-DD HH:mm') : 'Select Date & Time'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDateTimePickerVisible}
              mode="datetime"
              onConfirm={handleConfirmDateTime}
              onCancel={hideDateTimePicker}
            />

            <View style={styles.durationContainer}>
              <Text style={styles.durationLabel}>Slot Duration (minutes):</Text>
              <Picker
                selectedValue={slotDuration}
                onValueChange={(itemValue) => setSlotDuration(itemValue as number)}
                style={styles.picker}
              >
                <Picker.Item label="30" value={30} />
                <Picker.Item label="60" value={60} />
                <Picker.Item label="90" value={90} />
              </Picker>
            </View>

            <View style={styles.recurrenceContainer}>
              <Text style={styles.recurrenceLabel}>Repeat:</Text>
              <Picker
                selectedValue={recurrence}
                onValueChange={(itemValue) => setRecurrence(itemValue as 'none' | 'weekly' | 'monthly')}
                style={styles.picker}
              >
                <Picker.Item label="None" value="none" />
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Monthly" value="monthly" />
              </Picker>
            </View>

            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            {isLoading && <Text style={styles.loadingText}>Creating slot...</Text>}

            <TouchableOpacity style={styles.createButton} onPress={handleCreateSlot} disabled={isLoading}>
              <Text style={styles.createButtonText}>{isLoading ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  dateSelectorContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  dateButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#007bff',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  slotContainer: {
    marginTop: 20,
  },
  slotCard: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  availableSlot: {
    backgroundColor: '#e0f7fa',
  },
  bookedSlot: {
    backgroundColor: '#ffccbc',
  },
  slotText: {
    fontSize: 16,
    color: '#333',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pickerButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerButtonText: {
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007bff',
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
    backgroundColor: '#ccc',
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
    color: '#333',
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
    color: '#333',
    marginRight: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loadingText: {
    color: 'blue',
    marginBottom: 10,
  },
});

export default SlotItem;
