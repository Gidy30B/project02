const Schedule = require('../models/scheduleModel');

const generateTimeSlots = (shift) => {
  const slots = [];
  const startTime = new Date(`1970-01-01T${shift.startTime}:00`).getTime();
  const endTime = new Date(`1970-01-01T${shift.endTime}:00`).getTime();
  const duration = shift.durationOfConsultation * 60 * 1000; // convert to milliseconds

  let currentTime = startTime;

  while (currentTime + duration <= endTime) {
    const slotStart = new Date(currentTime).toISOString().split('T')[1].substring(0, 5);
    const slotEnd = new Date(currentTime + duration).toISOString().split('T')[1].substring(0, 5);

    // Check if the slot overlaps with any breaks
    const isDuringBreak = shift.breaks.some((b) => {
      const breakStart = new Date(`1970-01-01T${b.start}:00`).getTime();
      const breakEnd = new Date(`1970-01-01T${b.end}:00`).getTime();
      return (currentTime >= breakStart && currentTime < breakEnd) || (currentTime + duration > breakStart && currentTime + duration <= breakEnd);
    });

    if (!isDuringBreak) {
      slots.push({ start: slotStart, end: slotEnd });
    }

    currentTime += duration;
  }

  return slots;
};

const generateRecurringDates = (startDate, recurrence) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1); // Generate dates for one year

  while (start <= end) {
    dates.push(new Date(start).toISOString().split('T')[0]);
    if (recurrence === 'Daily') {
      start.setDate(start.getDate() + 1);
    } else if (recurrence === 'Weekly') {
      start.setDate(start.getDate() + 7);
    } else if (recurrence === 'Monthly') {
      start.setMonth(start.getMonth() + 1);
    } else {
      break;
    }
  }

  return dates;
};

const saveSchedule = async (req, res) => {
  try {
    const { professionalId, availability, recurrence } = req.body;

    const newAvailability = {};

    // Generate time slots for each shift
    for (const date in availability) {
      const shifts = availability[date].map((shift) => ({
        ...shift,
        timeSlots: generateTimeSlots(shift),
      }));

      const recurringDates = generateRecurringDates(date, recurrence);

      recurringDates.forEach((recurringDate) => {
        if (!newAvailability[recurringDate]) {
          newAvailability[recurringDate] = [];
        }
        newAvailability[recurringDate].push(...shifts);
      });
    }

    const schedule = new Schedule({ professionalId, availability: newAvailability, recurrence });
    await schedule.save();

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save the schedule.' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { scheduleId, updates } = req.body;

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    // Update only the necessary fields
    if (updates.professionalId) {
      schedule.professionalId = updates.professionalId;
    }
    if (updates.recurrence) {
      schedule.recurrence = updates.recurrence;
    }
    if (updates.availability) {
      for (const date in updates.availability) {
        const shifts = updates.availability[date].map((shift) => ({
          ...shift,
          timeSlots: generateTimeSlots(shift),
        }));

        const recurringDates = generateRecurringDates(date, schedule.recurrence);

        recurringDates.forEach((recurringDate) => {
          if (!schedule.availability.get(recurringDate)) {
            schedule.availability.set(recurringDate, []);
          }
          schedule.availability.set(recurringDate, shifts);
        });
      }
    }

    await schedule.save();
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the schedule.' });
  }
};

const getSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve the schedule.' });
  }
};

const getScheduleForDate = async (req, res) => {
  try {
    const { professionalId, date } = req.params;
    const schedule = await Schedule.findOne({ professionalId, 'availability.date': date }, { 'availability.$': 1 });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found for the specified date.' });
    }
    res.status(200).json({ slots: schedule.availability[0].timeSlots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve the schedule for the specified date.' });
  }
};

module.exports = {
  saveSchedule,
  updateSchedule,
  getSchedule,
  getScheduleForDate,
};