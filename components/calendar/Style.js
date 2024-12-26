import { StyleSheet, Dimensions } from 'react-native';
import { themeColor, lightThemeColor } from '../../mocks/theme';

const styles = StyleSheet.create({
    component: {
        width: Dimensions.get('window').width,
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: 'grey',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5
    },
    arrowButton: {
        paddingHorizontal: 10
    },
    title: {
        color: 'grey',
        fontWeight: 'bold'
    },
    week: {
        width: '100%',
        borderBottomColor: 'grey',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: 5
    },
    weekdayLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },
    weekdayLabel: {
        flex: 1,
        alignItems: 'center'
    },
    weekdayLabelText: {
        color: 'grey'
    }, 
    weekdayNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5
    },
    weekDayNumber: {
        flex: 1,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    weekDayNumberCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: 30/2,
    },
    weekDayNumberTextToday : {
        color: 'white'
    },
    schedule: {
        width: '100%'
    },
    pickerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    picker: {
        backgroundColor: 'white',
        paddingBottom: 20
    },
    modal: {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },
    blurredArea: {
        flex: 1,
        opacity: 0.7,
        backgroundColor: 'black'
    },
    modalButton: {
        padding: 15
    },
    modalButtonText: {
        fontSize: 20
    },
    indicator: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        position: 'absolute'
    },
    day: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopColor: 'grey',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    dayLabel: {
        width: '20%',
        alignItems: 'center',
        padding: 10,
        borderRightColor: 'grey',
        borderRightWidth: StyleSheet.hairlineWidth,
    },
    monthDateText: {
        fontSize: 20
    },
    dayText: {
        fontSize: 16,
        color: 'black',
    },
    allEvents: {
        width: '80%',
    },
    event: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10
    },
    eventDuration: {
        width: '30%',
        justifyContent: 'center'
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    durationDot: {
        width: 4,
        height: 4,
        backgroundColor: 'grey',
        marginRight: 5,
        alignSelf: 'center',
        borderRadius: 4/2,
    },
    durationDotConnector: {
        height: 20,
        borderLeftColor: 'grey',
        borderLeftWidth: StyleSheet.hairlineWidth,
        position: 'absolute',
        left: 2
    },
    durationText: {
        color: 'grey',
        fontSize: 12
    },
    eventNote: {
    },
    lineSeparator: {
        width: '100%',
        borderBottomColor: 'lightgrey',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    dot: {
        width: 4,
        height: 4,
        marginTop: 1,
        alignSelf: 'center',
        borderRadius: 4/2,
        position: 'absolute',
        bottom: '10%'
    },
    selectedDaySchedule: {
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    selectedDayTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    timeSlot: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    addSlotButton: {
        color: '#46c3ad', // Default theme color
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    shift: {
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 10,
    },
    shiftTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    slot: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    addShiftButton: {
        color: '#46c3ad', // Default theme color
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
    },
    calendarContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 10,
        flex: 1,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
    },
    dayContainer: {
        width: '14%',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: 'lightgrey',
        marginBottom: 10,
        borderRadius: 5,
    },
    selectedDayContainer: {
        backgroundColor: themeColor,
    },
    selectedDayText: {
        color: 'white',
    },
    markedIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        marginTop: 5,
    },
    section: {
        backgroundColor: lightThemeColor,
        padding: 10,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        width: '100%',
        paddingHorizontal: 10,
    },
    shiftsContainer: {
        marginVertical: 10,
    },
    shiftItem: {
        padding: 10,
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        marginVertical: 5,
    },
    scheduleContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    addButton: {
        padding: 10,
        backgroundColor: '#46c3ad',
        alignItems: 'center',
        margin: 10,
        borderRadius: 5,
    },
    indicatorsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
      },
      indicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#d3d3d3",
        marginHorizontal: 5,
      },
      activeIndicator: {
        backgroundColor: "#007BFF",
      },
      inputContainer: {
        backgroundColor: "#f0f0f0",
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
      },
      inputText: {
        fontSize: 16,
        color: "#333",
      },
      flexRow: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      activeInputButton: {
        backgroundColor: "#007BFF",
      },
      textInput: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
      },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      },
      modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        elevation: 5,
      },
      modalContent: {
        paddingBottom: 20,
      },
      promptText: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
      },
      flexIconRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
      },
      iconButton: {
        alignItems: "center",
        padding: 10,
      },
      iconText: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: "500",
      },
      modalButton: {
        backgroundColor: "#007BFF",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 15,
      },
      modalButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
      },
      inputButton: {
        backgroundColor: "#F8F9FA",
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
        alignItems: "center",
      },
      inputButtonText: {
        fontSize: 16,
        fontWeight: "500",
      },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalButton: {
        padding: 10,
        backgroundColor: '#46c3ad',
        alignItems: 'center',
        marginVertical: 5,
        borderRadius: 5,
        marginBottom: 10,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 16,
        marginBottom: 15,
    },
    dateTimePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        marginBottom: 15,
    },
    dateTimePicker: {
        width: '100%',
    },
    modalButton: {
        backgroundColor: '#46c3ad',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    agendaItem: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17,
    },
    agendaItemText: {
        color: '#888',
        fontSize: 16,
    },
    agenda: {
        flex: 1,
    },
    textWrapper: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        alignItems: 'center',
    },
    sliderContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    sliderLabel: {
        fontSize: 12,
        color: '#333',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    navButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width: '45%',
    },
    navButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default styles;