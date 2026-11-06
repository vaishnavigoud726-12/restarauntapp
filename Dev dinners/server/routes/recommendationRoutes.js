const express = require('express');
const router = express.Router();
const { helpMeChoose } = require('../controllers/recommendationController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/help-me-choose', optionalProtect, helpMeChoose);

module.exports = router;

