import React from "react";

const ScheduleShiftForm = ({ onAddShift, onSaveSchedule, shifts, selectedDate, setSelectedDate, shiftData, setShiftData, recurrence, setRecurrence, consultationDuration, setConsultationDuration, renderShiftPreview }) => {
  return (
    <div style={styles.formContainer}>
      {/* Schedule Form */}
      <div style={styles.formGroup}>
        <label htmlFor="recurrence" style={styles.label}>Recurrence</label>
        <select
          id="recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          style={styles.select}
        >
          <option value="none">Only for this day</option>
          <option value="daily">Repeat every day</option>
          <option value="weekly">Repeat weekly on this day</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label htmlFor="date" style={styles.label}>Choose the date for your shifts</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Shift Input Form */}
      <div style={styles.formGroup}>
        <label htmlFor="shiftName" style={styles.label}>Shift Name</label>
        <input
          type="text"
          id="shiftName"
          value={shiftData.name}
          onChange={(e) => setShiftData({ ...shiftData, name: e.target.value })}
          style={styles.input}
          placeholder="e.g., Morning Shift"
        />
      </div>

      <div style={styles.formGroupRow}>
        <div style={styles.formGroupHalf}>
          <label htmlFor="startTime" style={styles.label}>Start Time</label>
          <input
            type="time"
            id="startTime"
            value={shiftData.startTime}
            onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value })}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroupHalf}>
          <label htmlFor="endTime" style={styles.label}>End Time</label>
          <input
            type="time"
            id="endTime"
            value={shiftData.endTime}
            onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
            style={styles.input}
          />
        </div>
      </div>

      {/* Add Shift Button */}
      <div style={styles.buttonContainer}>
        <button
          onClick={onAddShift}
          style={{ ...styles.button, ...styles.addButton }}
        >
          Add Shift
        </button>
      </div>

      {/* Shift Preview */}
      {selectedDate && renderShiftPreview()}

      {/* Save Schedule Button */}
      <div style={styles.buttonContainer}>
        <button
          onClick={onSaveSchedule}
          style={{ ...styles.button, ...styles.saveButton }}
        >
          Save Schedule
        </button>
      </div>
    </div>
  );
};

const styles = {
  formContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupRow: {
    display: 'flex',
    gap: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  select: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    cursor: 'pointer',
  },
  addButton: {
    backgroundColor: '#4caf50',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2196f3',
    color: '#fff',
  },
};

export default ScheduleShiftForm;