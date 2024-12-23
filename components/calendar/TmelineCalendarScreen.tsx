import React, { useState, useEffect, useRef } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TouchableWithoutFeedback, Modal, Platform, ActivityIndicator, TextInput, Picker } from 'react-native';
import PropTypes from 'prop-types';
import moment, { Moment } from 'moment/min/moment-with-locales';
import DateTimePicker from '@react-native-community/datetimepicker';
import { applyLocale, displayTitleByLocale } from './Locale';
import styles from './Style';
import EditEventModal from './EditEventModal';

interface Event {
    start: string;
    duration: string;
    note: string;
}

interface WeeklyCalendarProps {
    selected: any;
    startWeekday: number;
    titleFormat?: string;
    weekdayFormat: string;
    locale: string;
    events: Event[];
    renderEvent?: (event: Event, index: number) => JSX.Element;
    renderFirstEvent?: (event: Event, index: number) => JSX.Element;
    renderLastEvent?: (event: Event, index: number) => JSX.Element;
    renderDay?: (eventViews: JSX.Element[], weekday: Moment, index: number) => JSX.Element;
    renderFirstDay?: (eventViews: JSX.Element[], weekday: Moment, index: number) => JSX.Element;
    renderLastDay?: (eventViews: JSX.Element[], weekday: Moment, index: number) => JSX.Element;
    onDayPress?: (weekday: Moment, index: number) => void;
    themeColor: string;
    style?: any;
    titleStyle?: any;
    dayLabelStyle?: any;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = props => {
    const [currDate, setCurrDate] = useState(moment(props.selected).locale(props.locale));
    const [weekdays, setWeekdays] = useState<Moment[]>([]);
    const [weekdayLabels, setWeekdayLabels] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState(currDate.clone());
    const [isCalendarReady, setCalendarReady] = useState(false);
    const [pickerDate, setPickerDate] = useState(currDate.clone());
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [cancelText, setCancelText] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [eventMap, setEventMap] = useState<Map<string, Event[]> | undefined>(undefined);
    const [scheduleView, setScheduleView] = useState<JSX.Element[] | undefined>(undefined);
    const [dayViewOffsets, setDayViewOffsets] = useState<number[] | undefined>(undefined);
    const scrollViewRef = useRef<ScrollView>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    useEffect(() => {
        applyLocale(props.locale, cancelText => setCancelText(cancelText), confirmText => setConfirmText(confirmText));
        createEventMap(props.events);
        setCalendarReady(true);
    }, []);

    const createEventMap = (events: Event[]) => {
        let dateMap = new Map<string, Event[]>();

        for (let i = 0; i < events.length; i++) {
            let eventDate = moment(events[i].start).format('YYYY-MM-DD').toString();
            if (dateMap.has(eventDate)) {
                let eventArr = dateMap.get(eventDate);
                eventArr!.push(events[i]);
                dateMap.set(eventDate, eventArr!);
            } else {
                dateMap.set(eventDate, [events[i]]);
            }
        }
        setEventMap(dateMap);
        createWeekdays(currDate, dateMap);
    };

    const createWeekdays = (date: Moment, map: Map<string, Event[]>) => {
        let dayViews: JSX.Element[] = [];
        let offsets: number[] = [];
        setWeekdays([]);
        for (let i = 0; i < 7; i++) {
            const weekdayToAdd = date.clone().weekday(props.startWeekday - 7 + i);
            setWeekdays(weekdays => [...weekdays, weekdayToAdd]);
            setWeekdayLabels(weekdayLabels => [...weekdayLabels, weekdayToAdd.format(props.weekdayFormat)]);

            let events = map.get(weekdayToAdd.format('YYYY-MM-DD').toString());
            let eventViews: JSX.Element[] = [];
            if (events !== undefined) {
                if (props.renderEvent !== undefined) {
                    eventViews = events.map((event, j) => {
                        if (props.renderFirstEvent !== undefined && j === 0) return props.renderFirstEvent(event, j);
                        else if (props.renderLastEvent !== undefined && j === events.length - 1) return props.renderLastEvent(event, j);
                        else return props.renderEvent(event, j);
                    });
                } else {
                    eventViews = events.map((event, j) => {
                        let startTime = moment(event.start).format('LT').toString();
                        let duration = event.duration.split(':');
                        let seconds = parseInt(duration[0]) * 3600 + parseInt(duration[1]) * 60 + parseInt(duration[2]);
                        let endTime = moment(event.start).add(seconds, 'seconds').format('LT').toString();
                        return (
                            <View key={i + "-" + j}>
                                <View style={styles.event}>
                                    <View style={styles.eventDuration}>
                                        <View style={styles.durationContainer}>
                                            <View style={styles.durationDot} />
                                            <Text style={styles.durationText}>{startTime}</Text>
                                        </View>
                                        <View style={{ paddingTop: 10 }} />
                                        <View style={styles.durationContainer}>
                                            <View style={styles.durationDot} />
                                            <Text style={styles.durationText}>{endTime}</Text>
                                        </View>
                                        <View style={styles.durationDotConnector} />
                                    </View>
                                    <View style={styles.eventNote}>
                                        <Text style={styles.eventText}>{event.note}</Text>
                                    </View>
                                </View>
                                {j < events.length - 1 && <View style={styles.lineSeparator} />}
                            </View>
                        );
                    });
                }
            }

            let dayView: JSX.Element | undefined = undefined;
            if (props.renderDay !== undefined) {
                if (props.renderFirstDay !== undefined && i === 0) dayView = props.renderFirstDay(eventViews, weekdayToAdd, i);
                else if (props.renderLastDay !== undefined && i === 6) dayView = props.renderLastDay(eventViews, weekdayToAdd, i);
                else dayView = props.renderDay(eventViews, weekdayToAdd, i);
            } else {
                dayView = (
                    <View key={i.toString()} style={styles.day} onLayout={event => { offsets[i] = event.nativeEvent.layout.y }}>
                        <View style={styles.dayLabel}>
                            <Text style={[styles.monthDateText, { color: props.themeColor }]}>{weekdayToAdd.format('M/D').toString()}</Text>
                            <Text style={[styles.dayText, { color: props.themeColor }]}>{weekdayToAdd.format(props.weekdayFormat).toString()}</Text>
                        </View>
                        <View style={[styles.allEvents, eventViews.length === 0 ? { width: '100%', backgroundColor: 'lightgrey' } : {}]}>
                            {eventViews}
                        </View>
                    </View>
                );
            }
            dayViews.push(dayView);
        }
        setScheduleView(dayViews);
        setDayViewOffsets(offsets);
    };

    const clickLastWeekHandler = () => {
        setCalendarReady(false);
        const lastWeekCurrDate = currDate.subtract(7, 'days');
        setCurrDate(lastWeekCurrDate.clone());
        setSelectedDate(lastWeekCurrDate.clone().weekday(props.startWeekday - 7));
        createWeekdays(lastWeekCurrDate.clone(), eventMap!);
        setCalendarReady(true);
    };

    const clickNextWeekHandler = () => {
        setCalendarReady(false);
        const nextWeekCurrDate = currDate.add(7, 'days');
        setCurrDate(nextWeekCurrDate.clone());
        setSelectedDate(nextWeekCurrDate.clone().weekday(props.startWeekday - 7));
        createWeekdays(nextWeekCurrDate.clone(), eventMap!);
        setCalendarReady(true);
    };

    const isSelectedDate = (date: Moment) => {
        return (selectedDate.year() === date.year() && selectedDate.month() === date.month() && selectedDate.date() === date.date());
    };

    const pickerOnChange = (_event: any, pickedDate?: Date) => {
        if (Platform.OS === 'android') {
            setDatePickerVisible(false);
            setLoading(true);
            if (pickedDate !== undefined) {
                setTimeout(() => {
                    let pickedDateMoment = moment(pickedDate).locale(props.locale);
                    setPickerDate(pickedDateMoment);
                    confirmPickerHandler(pickedDateMoment);
                    setLoading(false);
                }, 0);
            } else setLoading(false);
        }
        else setPickerDate(moment(pickedDate).locale(props.locale));
    };

    const confirmPickerHandler = (pickedDate: Moment) => {
        setCurrDate(pickedDate);
        setSelectedDate(pickedDate);

        setCalendarReady(false);
        createWeekdays(pickedDate, eventMap!);
        setCalendarReady(true);

        setDatePickerVisible(false);
    };

    const onDayPress = (weekday: Moment, i: number) => {
        scrollViewRef.current!.scrollTo({ y: dayViewOffsets![i], animated: true });
        setSelectedDate(weekday.clone());
        setCurrentEvent({
            date: weekday.format('YYYY-MM-DD'),
            start: new Date().toISOString(),
            end: new Date().toISOString(),
            title: '',
            color: '',
            summary: '',
            shifts: []
        });
        setModalVisible(true);
        if (props.onDayPress !== undefined) props.onDayPress(weekday.clone(), i);
    };

    const handleSave = (event: Event) => {
        console.log("Event saved:", event);
        setModalVisible(false);
    };

    useEffect(() => {
        console.log("Modal visibility:", isModalVisible);
        console.log("Current event:", currentEvent);
    }, [isModalVisible, currentEvent]);

    return (
        <View style={[styles.component, props.style]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.arrowButton} onPress={clickLastWeekHandler}>
                    <Text style={{ color: props.themeColor }}>{'\u25C0'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                    <Text style={[styles.title, props.titleStyle]}>{isCalendarReady && displayTitleByLocale(props.locale, selectedDate, props.titleFormat)}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowButton} onPress={clickNextWeekHandler}>
                    <Text style={{ color: props.themeColor }}>{'\u25B6'}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.week}>
                <View style={styles.weekdayLabelContainer}>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[0] : ''}</Text>
                    </View>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[1] : ''}</Text>
                    </View>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[2] : ''}</Text>
                    </View>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[3] : ''}</Text>
                    </View>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[4] : ''}</Text>
                    </View>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[5] : ''}</Text>
                    </View>
                    <View style={styles.weekdayLabel}>
                        <Text style={[styles.weekdayLabelText, props.dayLabelStyle]}>{weekdays.length > 0 ? weekdayLabels[6] : ''}</Text>
                    </View>
                </View>
                <View style={styles.weekdayNumberContainer}>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[0], 0)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[0]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[0]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[0].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[0].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[0]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[1], 1)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[1]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[1]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[1].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[1].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[1]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[2], 2)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[2]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[2]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[2].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[2].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[2]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[3], 3)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[3]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[3]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[3].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[3].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[3]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[4], 4)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[4]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[4]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[4].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[4].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[4]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[5], 5)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[5]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[5]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[5].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[5].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[5]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekDayNumber} onPress={onDayPress.bind(this, weekdays[6], 6)}>
                        <View style={isCalendarReady && isSelectedDate(weekdays[6]) ? [styles.weekDayNumberCircle, { backgroundColor: props.themeColor }] : {}}>
                            <Text style={isCalendarReady && isSelectedDate(weekdays[6]) ? styles.weekDayNumberTextToday : { color: props.themeColor }}>
                                {isCalendarReady ? weekdays[6].date() : ''}
                            </Text>
                        </View>
                        {isCalendarReady && eventMap!.get(weekdays[6].format('YYYY-MM-DD').toString()) !== undefined &&
                            <View style={isSelectedDate(weekdays[6]) ? [styles.dot, { backgroundColor: 'white' }] : [styles.dot, { backgroundColor: props.themeColor }]} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView ref={scrollViewRef} style={styles.schedule}>
                {(scheduleView !== undefined) && scheduleView}
            </ScrollView>
            {Platform.OS === 'ios' && <Modal
                transparent={true}
                animationType='fade'
                visible={isDatePickerVisible}
                onRequestClose={() => setDatePickerVisible(false)}
                style={styles.modal}
            >
                <TouchableWithoutFeedback onPress={() => setDatePickerVisible(false)}>
                    <View style={styles.blurredArea} />
                </TouchableWithoutFeedback>
                <View style={styles.pickerButtons}>
                    <TouchableOpacity style={styles.modalButton} onPress={() => setDatePickerVisible(false)}>
                        <Text style={styles.modalButtonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalButton} onPress={confirmPickerHandler.bind(this, pickerDate)}>
                        <Text style={styles.modalButtonText}>{confirmText}</Text>
                    </TouchableOpacity>
                </View>
                <DateTimePicker
                    locale={props.locale}
                    value={pickerDate.toDate()}
                    onChange={pickerOnChange}
                    style={styles.picker}
                />
            </Modal>}
            {Platform.OS === 'android' && isDatePickerVisible && <DateTimePicker
                locale={props.locale}
                value={pickerDate.toDate()}
                display='spinner'
                onChange={pickerOnChange}
            />}
            {isModalVisible && (
                <EditEventModal
                    isVisible={isModalVisible}
                    event={currentEvent}
                    onClose={() => setModalVisible(false)}
                    onSave={handleSave}
                    isNew={true}
                />
            )}
            {(!isCalendarReady || isLoading) && <ActivityIndicator size='large' color='grey' style={styles.indicator} />}
        </View>
    )

};

WeeklyCalendar.propTypes = {
    selected: PropTypes.any,
    startWeekday: PropTypes.number,
    titleFormat: PropTypes.string,
    weekdayFormat: PropTypes.string,
    locale: PropTypes.string,
    events: PropTypes.array,
    renderEvent: PropTypes.func,
    renderFirstEvent: PropTypes.func,
    renderLastEvent: PropTypes.func,
    renderDay: PropTypes.func,
    renderFirstDay: PropTypes.func,
    renderLastDay: PropTypes.func,
    onDayPress: PropTypes.func,
    themeColor: PropTypes.string,
    style: PropTypes.any,
    titleStyle: PropTypes.any,
    dayLabelStyle: PropTypes.any
};

WeeklyCalendar.defaultProps = {
    selected: moment(),
    startWeekday: 7,
    titleFormat: undefined,
    weekdayFormat: 'ddd',
    locale: 'en',
    events: [],
    renderEvent: undefined,
    renderFirstEvent: undefined,
    renderLastEvent: undefined,
    renderDay: undefined,
    renderFirstDay: undefined,
    renderLastDay: undefined,
    onDayPress: undefined,
    themeColor: '#46c3ad',
    style: {},
    titleStyle: {},
    dayLabelStyle: {},
};

export default WeeklyCalendar;