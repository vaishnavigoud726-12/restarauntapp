const express = require('express');
const router = express.Router();
const {
  createGroupPlan,
  getGroupByCode,
  voteForRestaurant,
  finalizeGroupPlan,
} = require('../controllers/groupDiningController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('customer'), createGroupPlan);
router.get('/code/:shareCode', getGroupByCode);
router.post('/:id/vote', protect, authorize('customer'), voteForRestaurant);
router.post('/:id/finalize', protect, authorize('customer'), finalizeGroupPlan);

module.exports = router;

