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
    paymentMethod: paymentMethod === 'online' ? 'online' : 'cash_on_delivery'
  });

  res.status(201).json({ success: true, message: 'تم إنشاء الطلب بنجاح', data: order });
});

const MF_BASE = () => process.env.MYFATOORAH_BASE_URL || 'https://apitest.myfatoorah.com';
const MF_TOKEN = () => process.env.MYFATOORAH_TOKEN;
const mfHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${MF_TOKEN()}` });

// POST /api/orders/:id/myfatoorah-session
exports.createMyFatoorahSession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('الطلب غير موجود', 404);

  const grandTotal = Math.round(Number(order.totalPrice) * 100) / 100;
  console.log('[MF] grandTotal:', grandTotal, '| token length:', MF_TOKEN()?.length, '| token start:', MF_TOKEN()?.slice(0, 30));

  if (!grandTotal || grandTotal <= 0) throw new AppError('قيمة الطلب غير صالحة', 400);
  if (!MF_TOKEN()) throw new AppError('إعداد بوابة الدفع غير مكتمل', 500);

  let initiateData;
  try {
    const initiatePayload = { InvoiceAmount: grandTotal, CurrencyIso: 'SAR' };
    console.log('[MF Initiate URL]', `${MF_BASE()}/v2/InitiatePayment`);
    console.log('[MF Initiate Payload]', JSON.stringify(initiatePayload));
    console.log('[MF Token Full]', MF_TOKEN());
    const initiateRes = await fetch(`${MF_BASE()}/v2/InitiatePayment`, {
      method: 'POST',
      headers: mfHeaders(),
      body: JSON.stringify(initiatePayload)
    });
    const rawText = await initiateRes.text();
    console.log('[MF Initiate RAW]', initiateRes.status, rawText.slice(0, 1000));
    initiateData = JSON.parse(rawText);
  } catch (e) {
    console.error('[MF Initiate ERROR]', e.message);
    throw new AppError('فشل الاتصال بخادم الدفع', 500);
  }

  if (!initiateData.IsSuccess) throw new AppError(initiateData.Message || 'فشل تهيئة الدفع', 400);

  const methods = initiateData.Data?.PaymentMethods;
  const methodId = methods?.[0]?.PaymentMethodId ?? 1;
  console.log('[MF] using methodId:', methodId);

  let data;
  try {
    const executeRes = await fetch(`${MF_BASE()}/v2/ExecutePayment`, {
      method: 'POST',
      headers: mfHeaders(),
      body: JSON.stringify({
        PaymentMethodId: methodId,
        InvoiceValue: grandTotal,
        CurrencyIso: 'SAR',
        CustomerName: order.customerName,
        CustomerMobile: order.phone.replace(/^0/, ''),
        CustomerEmail: `${order.phone}@homly.sa`,
        CallBackUrl: `${process.env.FRONTEND_URL}/order-success?id=${order._id}&verify=mf`,
        ErrorUrl: `${process.env.FRONTEND_URL}/checkout?error=payment_failed`,
        Language: 'AR',
        DisplayCurrencyIso: 'SAR',
        UserDefinedField: order._id.toString()
      })
    });
    data = await executeRes.json();
    console.log('[MF Execute]', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[MF Execute ERROR]', e.message);
    throw new AppError('فشل تنفيذ الدفع', 500);
  }

  if (!data.IsSuccess) {
    throw new AppError(data.Message || data.ValidationErrors?.[0]?.Error || JSON.stringify(data), 400);
  }

  const payUrl = data.Data?.PaymentURL;
  if (!payUrl) throw new AppError('لم يتم الحصول على رابط الدفع', 400);

  order.mfInvoiceId = data.Data.InvoiceId;
  order.paymentMethod = 'online';
  await order.save();

  res.json({ success: true, payUrl, invoiceId: data.Data.InvoiceId });
});

// GET /api/orders/:id/verify-payment?invoiceId=xxx
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { invoiceId } = req.query;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('الطلب غير موجود', 404);

  const response = await fetch(`${MF_BASE()}/v2/getPaymentStatus`, {
    method: 'POST',
    headers: mfHeaders(),
    body: JSON.stringify({ Key: invoiceId, KeyType: 'InvoiceId' })
  });

  const data = await response.json();
  if (!response.ok || !data.IsSuccess) throw new AppError('فشل التحقق من الدفع', 400);

  const invoiceStatus = data.Data?.InvoiceStatus;
  if (invoiceStatus === 'Paid') {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();
    res.json({ success: true, message: 'تم التحقق من الدفع بنجاح', data: order });
  } else {
    order.paymentStatus = 'failed';
    await order.save();
    throw new AppError('لم يتم الدفع بعد', 400);
  }
});

const HP_BASE = () => process.env.HYPERPAY_BASE_URL || 'https://eu-test.oppwa.com';
const HP_TOKEN = () => process.env.HYPERPAY_ACCESS_TOKEN;
const HP_ENTITY_ID = () => process.env.HYPERPAY_ENTITY_ID;

// POST /api/orders/:id/hyperpay-session
exports.createHyperPaySession = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('الطلب غير موجود', 404);

  const grandTotal = (Math.round(Number(order.totalPrice) * 100) / 100).toFixed(2);
  if (!grandTotal || Number(grandTotal) <= 0) throw new AppError('قيمة الطلب غير صالحة', 400);
  if (!HP_TOKEN() || !HP_ENTITY_ID()) throw new AppError('إعداد بوابة HyperPay غير مكتمل', 500);

  const nameParts = order.customerName.trim().split(' ');
  const firstName = nameParts[0] || 'عميل';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const params = new URLSearchParams({
    'entityId': HP_ENTITY_ID(),
    'amount': grandTotal,
    'currency': 'SAR',
    'paymentType': 'DB',
    'merchantTransactionId': order._id.toString(),
    'customer.email': `${order.phone}@homly.sa`,
    'customer.givenName': firstName,
    'customer.surname': lastName,
    'billing.street1': order.address,
    'billing.city': 'الرياض',
    'billing.state': 'الرياض',
    'billing.country': 'SA',
    'billing.postcode': '12345',
    'customParameters[3DS2_enrolled]': 'true',
    'testMode': 'EXTERNAL',
  });

  let checkoutData;
  try {
    const hpRes = await fetch(`${HP_BASE()}/v1/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HP_TOKEN()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    checkoutData = await hpRes.json();
    console.log('[HyperPay Checkout]', JSON.stringify(checkoutData, null, 2));
  } catch (e) {
    console.error('[HyperPay ERROR]', e.message);
    throw new AppError('فشل الاتصال بخادم HyperPay', 500);
  }

  const resultCode = checkoutData?.result?.code;
  if (!resultCode || !resultCode.startsWith('000.200')) {
    throw new AppError(checkoutData?.result?.description || 'فشل إنشاء جلسة HyperPay', 400);
  }

  order.hyperPayCheckoutId = checkoutData.id;
  order.paymentMethod = 'online';
  await order.save();

  res.json({ success: true, checkoutId: checkoutData.id });
});

// GET /api/orders/:id/verify-hyperpay?resourcePath=xxx
exports.verifyHyperPayment = asyncHandler(async (req, res) => {
  const { resourcePath } = req.query;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('الطلب غير موجود', 404);
  if (!resourcePath) throw new AppError('resourcePath مطلوب', 400);

  let paymentData;
  try {
    const hpRes = await fetch(`${HP_BASE()}${resourcePath}?entityId=${HP_ENTITY_ID()}`, {
      headers: { 'Authorization': `Bearer ${HP_TOKEN()}` },
    });
    paymentData = await hpRes.json();
    console.log('[HyperPay Verify]', JSON.stringify(paymentData, null, 2));
  } catch (e) {
    console.error('[HyperPay Verify ERROR]', e.message);
    throw new AppError('فشل التحقق من الدفع', 500);
  }

  const code = paymentData?.result?.code;
  const isSuccess = code && (/^(000\.000\.|000\.100\.1|000\.[36])/.test(code));

  if (isSuccess) {
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();
    res.json({ success: true, message: 'تم التحقق من الدفع بنجاح', data: order });
  } else {
    order.paymentStatus = 'failed';
    await order.save();
    throw new AppError(paymentData?.result?.description || 'لم يتم الدفع', 400);
  }
});

// GET /api/orders/:id/receipt (public - for invoice page)
exports.getOrderPublic = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select('customerName phone address notes items totalPrice paymentMethod paymentStatus status createdAt')
    .lean();
  if (!order) throw new AppError('الطلب غير موجود', 404);
  res.json({ success: true, data: order });
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
