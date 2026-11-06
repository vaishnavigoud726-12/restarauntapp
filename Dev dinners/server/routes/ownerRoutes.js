const express = require('express');
const router = express.Router();
const {
  getOwnerDashboard,
  getMyMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMyTables,
  addTable,
  deleteTable,
  getOwnerBookings,
} = require('../controllers/ownerPortalController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All owner routes protected & role-checked
router.use(protect, authorize('restaurant_owner'));

router.get('/dashboard', getOwnerDashboard);
router.get('/menu', getMyMenu);
router.post('/menu', addMenuItem);
router.put('/menu/:id', updateMenuItem);
router.delete('/menu/:id', deleteMenuItem);

router.get('/tables', getMyTables);
router.post('/tables', addTable);
router.delete('/tables/:id', deleteTable);

router.get('/bookings', getOwnerBookings);

module.exports = router;

