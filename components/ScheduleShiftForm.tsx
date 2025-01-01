import React, { useState } from "react";

const ScheduleShiftForm = ({ onAddShift, onSaveSchedule, shifts, selectedDate, setSelectedDate, shiftData, setShiftData, recurrence, setRecurrence, consultationDuration, setConsultationDuration, renderShiftPreview }) => {
  return (
    <>
      {/* Schedule Form */}
      <div className="mb-4">
        <label htmlFor="recurrence" className="block text-gray-700 font-medium">Recurrence</label>
        <select
          id="recurrence"
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="none">Only for this day</option>
          <option value="daily">Repeat every day</option>
          <option value="weekly">Repeat weekly on this day</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="date" className="block text-gray-700 font-medium">Choose the date for your shifts</label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Shift Input Form */}
      <div className="space-y-4">
        <div>
          <label htmlFor="shiftName" className="block text-gray-700">Shift Name</label>
          <input
            type="text"
            id="shiftName"
            value={shiftData.name}
            onChange={(e) => setShiftData({ ...shiftData, name: e.target.value })}
            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Morning Shift"
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label htmlFor="startTime" className="block text-gray-700">Start Time</label>
            <input
              type="time"
              id="startTime"
              value={shiftData.startTime}
              onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value })}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="endTime" className="block text-gray-700">End Time</label>
            <input
              type="time"
              id="endTime"
              value={shiftData.endTime}
              onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Add Shift Button */}
      <div className="mt-4">
        <button
          onClick={onAddShift}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
        >
          Add Shift
        </button>
      </div>

      {/* Shift Preview */}
      {selectedDate && renderShiftPreview()}

      {/* Save Schedule Button */}
      <div className="mt-6">
        <button
          onClick={onSaveSchedule}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md shadow-md hover:bg-green-700"
        >
          Save Schedule
        </button>
      </div>
    </>
  );
};

export default ScheduleShiftForm;
