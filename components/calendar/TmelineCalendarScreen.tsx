import React, {useRef, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';
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

const ExpandableCalendarScreen = ({ weekView = false }: Props) => {
  const marked = useRef(getMarkedDates());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

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
    return <AgendaItem item={item}/>;
  }, []);

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
     
      showTodayButton
      
      theme={todayBtnTheme.current}
     
    >
      {weekView ? (
        <WeekCalendar testID={testIDs.weekCalendar.CONTAINER} firstDay={1} markedDates={marked.current}/>
      ) : (
        <ExpandableCalendar
          testID={testIDs.expandableCalendar.CONTAINER}
       
          theme={theme.current}
         
          firstDay={1}
          markedDates={marked.current}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          
        />
      )}
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
       
        sectionStyle={styles.section}
        
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
  }
});