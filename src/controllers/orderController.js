const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/orders - guest checkout
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, address, notes, items, paymentMethod } = req.body;

  if (!items || items.length === 0) throw new AppError('يرجى إضافة منتجات للطلب', 400);

  let totalPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) throw new AppError(`المنتج غير موجود: ${item.productId}`, 404);
    if (product.stock < item.quantity) {
      throw new AppError(`المنتج "${product.name}" غير متوفر بالكمية المطلوبة. المتاح: ${product.stock}`, 400);
    }
    orderItems.push({ productId: product._id, name: product.name, price: product.price, quantity: item.quantity });
    totalPrice += product.price * item.quantity;
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    customerName, phone, address, notes, items: orderItems, totalPrice,
    paymentMethod: paymentMethod === 'tap' ? 'tap' : 'cash_on_delivery'
  });

  res.status(201).json({ success: true, message: 'تم إنشاء الطلب بنجاح', data: order });
});

// POST /api/orders/:id/tap-session - إنشاء جلسة دفع Tap
exports.createTabbySession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('الطلب غير موجود', 404);

  const nameParts = order.customerName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const response = await fetch('https://api.tap.company/v2/charges', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`
    },
    body: JSON.stringify({
      amount: order.totalPrice,
      currency: 'SAR',
      customer: {
        first_name: firstName,
        last_name: lastName,
        email: `${order.phone}@placeholder.com`,
        phone: { country_code: '966', number: order.phone.replace(/^0/, '') }
      },
      source: { id: 'src_all' },
      transaction: { timezone: 'Asia/Riyadh', created: new Date().toISOString() },
      order: { id: order._id.toString(), currency: 'SAR', amount: order.totalPrice },
      redirect: { url: `${process.env.FRONTEND_URL}/order-success?id=${order._id}&verify=true` },
      post: { url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/orders/${order._id}/tap-webhook` }
    })
  });

  const data = await response.json();

  if (!response.ok) throw new AppError(data.errors?.[0]?.description || data.message || 'فشل إنشاء جلسة الدفع', 400);

  const checkoutUrl = data.transaction?.url;
  if (!checkoutUrl) throw new AppError('لم يتم الحصول على رابط الدفع', 400);

  res.json({ success: true, checkoutUrl, chargeId: data.id });
});

// GET /api/orders/:id/verify-payment?tap_id=xxx
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { tap_id } = req.query;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('الطلب غير موجود', 404);

  const response = await fetch(`https://api.tap.company/v2/charges/${tap_id}`, {
    headers: { 'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}` }
  });

  const charge = await response.json();

  if (charge.status === 'CAPTURED') {
    order.paymentStatus = 'paid';
    order.tapChargeId = tap_id;
    order.status = 'confirmed';
    await order.save();
    res.json({ success: true, message: 'تم التحقق من الدفع بنجاح', data: order });
  } else {
    order.paymentStatus = 'failed';
    await order.save();
    throw new AppError('فشل التحقق من الدفع', 400);
  }
});

// GET /api/orders (admin)
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Order.countDocuments(filter)
  ]);

  res.json({
    success: true, message: 'تم جلب الطلبات', data: orders,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
  });
});

// GET /api/orders/:id (admin)
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw new AppError('الطلب غير موجود', 404);
  res.json({ success: true, message: 'تم جلب الطلب', data: order });
});

// PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) throw new AppError('حالة غير صالحة', 400);

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) throw new AppError('الطلب غير موجود', 404);
  res.json({ success: true, message: 'تم تحديث حالة الطلب', data: order });
});
