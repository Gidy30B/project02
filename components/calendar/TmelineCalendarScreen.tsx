import React, {useRef, useCallback, useState} from 'react';
import {StyleSheet, FlatList, View, Text, TouchableOpacity} from 'react-native';
import {CalendarProvider, WeekCalendar} from 'react-native-calendars';
import testIDs from '../../testIDs';
import {agendaItems, getMarkedDates} from '../../mocks/agendaItems';
import AgendaItem from '../../mocks/AgendaItem';
import {getTheme, themeColor, lightThemeColor} from '../../mocks/theme';

const leftArrowIcon = require('../../assets/images/icons/previous.png');
const rightArrowIcon = require('../../assets/images/icons/next.png');
const ITEMS: any[] = agendaItems;

interface Props {
  weekView?: boolean;
}

const CustomCalendar = ({markedDates, onDayPress}: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    onDayPress(date);
  };

  return (
    <View style={styles.calendarContainer}>
      {Object.keys(markedDates).map((date) => (
        <TouchableOpacity key={date} onPress={() => handleDayPress(date)} style={styles.dayContainer}>
          <Text style={styles.dayText}>{date}</Text>
          {markedDates[date]?.marked && <View style={styles.markedIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ExpandableCalendarScreen = ({ weekView = false }: Props) => {
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

  console.log('ITEMS:', ITEMS);
  console.log('marked:', marked.current);

  const createNewEvent: TimelineProps["onBackgroundLongPress"] = (
    timeString,
    timeObject
  ) => {
    const { eventsByDate } = this.state;
    const hourString = `${(timeObject.hour + 1).toString().padStart(2, "0")}`;
    const minutesString = `${timeObject.minutes.toString().padStart(2, "0")}`;

    const newEvent = {
      id: "draft",
      start: `${timeString}`,
      end: `${timeObject.date} ${hourString}:${minutesString}:00`,
      title: "New Event",
      color: "white",
    };

    if (timeObject.date) {
      if (eventsByDate[timeObject.date]) {
        eventsByDate[timeObject.date] = [
          ...eventsByDate[timeObject.date],
          newEvent,
        ];
        this.setState({ eventsByDate });
      } else {
        eventsByDate[timeObject.date] = [newEvent];
        this.setState({ eventsByDate: { ...eventsByDate } });
      }
    }
  };

  const approveNewEvent = (timeString, timeObject) => {
    const { eventsByDate } = this.state;
    const hourString = `${(timeObject.hour + 1).toString().padStart(2, "0")}`;
    const minutesString = `${timeObject.minutes.toString().padStart(2, "0")}`;

    this.setState({
      modalVisible: true,
      selectedEvent: {
        id: `event-${Date.now()}`,
        start: `${timeString}`,
        end: `${timeObject.date} ${hourString}:${minutesString}:00`,
        title: "New event",
        color: "white",
        summary: "Summary of new event",
      },
      isNewEvent: true,
      newEventStartTime: timeObject.date,
    });

    if (timeObject.date) {
      eventsByDate[timeObject.date] = filter(
        eventsByDate[timeObject.date],
        (e) => e.id !== "draft"
      );

      this.setState({
        eventsByDate,
      });
    }
  };

  const renderItem = useCallback(({item}: any) => {
    console.log('Rendering item:', item);
    return <AgendaItem item={item}/>;
  }, []);

  const keyExtractor = useCallback((item: any, index: number) => {
    return item.title + index;
  }, []);

  const renderSectionHeader = ({section}: any) => {
    return (
      <View style={styles.section}>
        <Text>{section.title}</Text>
      </View>
    );
  };

  console.log('AgendaList sections:', ITEMS);

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
      showTodayButton
      theme={todayBtnTheme.current}
    >
      {weekView ? (
        <WeekCalendar testID={testIDs.weekCalendar.CONTAINER} firstDay={1} markedDates={marked.current}/>
      ) : (
        <CustomCalendar
          markedDates={marked.current}
          onDayPress={(date: string) => console.log('Selected date:', date)}
        />
      )}
      <FlatList
        data={ITEMS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderSectionHeader}
      />
    </CalendarProvider>
  );
};

export default ExpandableCalendarScreen;

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  header: {
    backgroundColor: 'lightgrey'
  },
  section: {
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize'
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10
  },
  dayContainer: {
    width: '14%',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgrey',
    marginBottom: 10
  },
  dayText: {
    fontSize: 16,
    color: 'black'
  },
  markedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginTop: 5
  }
});