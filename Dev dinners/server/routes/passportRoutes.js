const express = require('express');
const router = express.Router();
const { getMyPassport } = require('../controllers/passportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/summary', protect, authorize('customer'), getMyPassport);

module.exports = router;

