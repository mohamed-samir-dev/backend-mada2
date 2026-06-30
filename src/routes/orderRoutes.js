const router = require('express').Router();
const protect = require('../middlewares/auth');
const { createOrder, createMyFatoorahSession, verifyPayment, createHyperPaySession, verifyHyperPayment, getOrders, getOrder, getOrderPublic, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder);
router.post('/:id/myfatoorah-session', createMyFatoorahSession);
router.get('/:id/verify-payment', verifyPayment);
router.post('/:id/hyperpay-session', createHyperPaySession);
router.get('/:id/verify-hyperpay', verifyHyperPayment);
router.get('/:id/receipt', getOrderPublic);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
