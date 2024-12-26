import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Agenda, AgendaEntry } from 'react-native-calendars';
import { useSelector } from 'react-redux';
import { selectAppointments } from '../(redux)/appointmentSlice';
import useAppointments from '../../hooks/useAppointments';
import { Pressable } from 'react-native';
import events from '../../assets/events.json';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const Schedule = () => {
  const navigation = useNavigation();
  const { transformAppointmentsToAgendaFormat } = useAppointments();
  const [items, setItems] = useState({});

  useEffect(() => {
    const formattedAppointments = transformAppointmentsToAgendaFormat(events);
    setItems(formattedAppointments);
  }, []);

  const renderItem = (reservation: AgendaEntry, isFirst: boolean) => {
    const fontSize = isFirst ? 16 : 14;
    const color = isFirst ? "black" : "#43515c";

    return (
      <Pressable
        style={[styles.item, { height: reservation.height }]}
        onPress={() => router.push('/modal', { id: reservation.id })}
        >
        <Text style={{ fontSize, color }}>{reservation.name}</Text>
      </Pressable>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text>This is empty date!</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        selected={Object.keys(items)[0]}
        showOnlySelectedDayEvents={true}
      />
    </View>
  );
};

export default Schedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});