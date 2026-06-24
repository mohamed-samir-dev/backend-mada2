const router = require('express').Router();
const protect = require('../middlewares/auth');
const { createOrder, createTabbySession, verifyPayment, getOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder);
router.post('/:id/tabby-session', createTabbySession);
router.get('/:id/verify-payment', verifyPayment);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
