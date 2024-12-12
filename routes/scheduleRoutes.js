const express = require('express');
const { saveSchedule, updateSchedule, getSchedule, getScheduleForDate } = require('../controllers/scheduleController');

const router = express.Router();

router.post('/schedule', saveSchedule);
router.put('/schedule', updateSchedule);
router.get('/schedule/:scheduleId', getSchedule);
router.get('/:professionalId/:date', getScheduleForDate);

module.exports = router;