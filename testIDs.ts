interface TestIDs {
  menu: {
    CONTAINER: string;
    CALENDARS: string;
    CALENDAR_LIST: string;
    HORIZONTAL_LIST: string;
    AGENDA: string;
    AGENDA_INFINITE: string;
    EXPANDABLE_CALENDAR: string;
    WEEK_CALENDAR: string;
    TIMELINE_CALENDAR: string;
    PLAYGROUND: string;
  };
  calendars: {
    CONTAINER: string;
    FIRST: string;
    LAST: string;
  };
  calendarList: {
    CONTAINER: string;
  };
  horizontalList: {
    CONTAINER: string;
  };
  agenda: {
    CONTAINER: string;
    ITEM: string;
  };
  expandableCalendar: {
    CONTAINER: string;
  };
  weekCalendar: {
    CONTAINER: string;
  };
}

const testIDs: TestIDs = {
  menu: {
    CONTAINER: 'menu',
    CALENDARS: 'calendars_btn',
    CALENDAR_LIST: 'calendar_list_btn',
    HORIZONTAL_LIST: 'horizontal_list_btn',
    AGENDA: 'agenda_btn',
    AGENDA_INFINITE: 'agenda_infinite_btn',
    EXPANDABLE_CALENDAR: 'expandable_calendar_btn',
    WEEK_CALENDAR: 'week_calendar_btn',
    TIMELINE_CALENDAR: 'timeline_calendar_btn',
    PLAYGROUND: 'playground_btn'
  },
  calendars: {
    CONTAINER: 'calendars',
    FIRST: 'first_calendar',
    LAST: 'last_calendar'
  },
  calendarList: {CONTAINER: 'calendarList'},
  horizontalList: {CONTAINER: 'horizontalList'},
  agenda: {
    CONTAINER: 'agenda',
    ITEM: 'item'
  },
  expandableCalendar: {CONTAINER: 'expandableCalendar'},
  weekCalendar: {CONTAINER: 'weekCalendar'}
};

export default testIDs;
