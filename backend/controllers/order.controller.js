import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const orderStatusProgression = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
  try {
    const userId = req.user?._id ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { shippingAddress } = req.body;
    const addressFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
    if (
      !shippingAddress ||
      addressFields.some((field) =>
        typeof shippingAddress[field] !== "string" || !shippingAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is incomplete or contains invalid fields."
      });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId?.startsWith("rzp_test_") || !keySecret || keySecret.startsWith("your_")) {
      return res.status(503).json({
        success: false,
        message: "Razorpay Test Mode credentials are not configured on the server."
      });
    }

    const snapshotItems = await Promise.all(user.cart.map(async (item) => {
      const prodId = item.product?._id || item.product;
      if (!isValidObjectId(prodId)) {
        throw Object.assign(new Error("Invalid product ID in cart"), { statusCode: 400 });
      }

      const product = await Product.findById(prodId);
      if (!product) {
        throw Object.assign(new Error("Product in cart no longer exists"), { statusCode: 400 });
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1 || product.stock < item.quantity) {
        throw Object.assign(new Error(`Insufficient stock for ${product.name}.`), { statusCode: 400 });
      }

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      };
    }));

    const amount = snapshotItems.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0
    );
    const totalAmount = amount / 100;

    const order = await Order.create({
      user: userId,
      items: snapshotItems,
      shippingAddress,
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    let razorpayOrder;
    try {
      const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      razorpayOrder = await instance.orders.create({
        amount,
        currency: "INR",
        receipt: order._id.toString()
      });
    } catch (razorpayError) {
      await Order.deleteOne({ _id: order._id });
      console.error("Razorpay order creation failed:", razorpayError);
      return res.status(502).json({
        success: false,
        message: "Unable to start Razorpay checkout. Please try again."
      });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: keyId
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    console.error("Create payment order error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
  let claimedOrderId;
  let decrementedProducts = [];
  let orderMarkedPaid = false;
  try {
    const userId = req.user?._id ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      shopKartOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = req.body;

    if (
      !isValidObjectId(shopKartOrderId) ||
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string"
    ) {
      return res.status(400).json({ success: false, message: "Payment verification details are incomplete" });
    }

    const order = await Order.findOne({ _id: shopKartOrderId, user: userId });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || !order.razorpayOrderId) {
      return res.status(503).json({
        success: false,
        message: "Payment verification is not configured on the server."
      });
    }

    if (razorpayOrderId !== order.razorpayOrderId) {
      return res.status(400).json({ success: false, message: "Invalid Razorpay order ID" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${order.razorpayOrderId}|${razorpayPaymentId}`)
      .digest();
    if (!/^[a-f\d]{64}$/i.test(razorpaySignature)) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
    const receivedSignature = Buffer.from(razorpaySignature, "hex");

    if (
      receivedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    if (order.paymentStatus === "PAID") {
      if (order.razorpayPaymentId !== razorpayPaymentId) {
        return res.status(409).json({ success: false, message: "Order has already been paid" });
      }
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    if (order.paymentStatus !== "PENDING" || order.status !== "PENDING_PAYMENT") {
      return res.status(409).json({ success: false, message: "This order is not awaiting payment" });
    }

    const claimedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: userId,
        paymentStatus: "PENDING",
        status: "PENDING_PAYMENT",
        verificationInProgress: { $ne: true }
      },
      { $set: { verificationInProgress: true } },
      { new: true }
    );
    if (!claimedOrder) {
      const currentOrder = await Order.findById(order._id);
      if (currentOrder?.paymentStatus === "PAID" && currentOrder.razorpayPaymentId === razorpayPaymentId) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          order: currentOrder
        });
      }
      return res.status(409).json({ success: false, message: "Payment verification is already in progress" });
    }
    claimedOrderId = claimedOrder._id;

    for (const item of claimedOrder.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!product) {
        await Promise.all(decrementedProducts.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
        ));
        decrementedProducts = [];
        await Order.updateOne({ _id: claimedOrder._id }, { $set: { verificationInProgress: false } });
        claimedOrderId = undefined;
        return res.status(409).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Contact support before retrying this payment.`
        });
      }
      decrementedProducts.push({ productId: item.product, quantity: item.quantity });
    }

    claimedOrder.paymentStatus = "PAID";
    claimedOrder.status = "PLACED";
    claimedOrder.razorpayPaymentId = razorpayPaymentId;
    claimedOrder.verificationInProgress = false;
    await claimedOrder.save();
    orderMarkedPaid = true;

    const user = await Customer.findById(userId);
    if (user) {
      user.cart = [];
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order: claimedOrder
    });
  } catch (error) {
    if (claimedOrderId && !orderMarkedPaid) {
      try {
        await Promise.all(decrementedProducts.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
        ));
        await Order.updateOne({ _id: claimedOrderId }, { $set: { verificationInProgress: false } });
      } catch (cleanupError) {
        console.error("Payment verification cleanup failed:", cleanupError);
      }
    }
    console.error("Verify payment error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?._id ?? req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /orders/:id
export const getOrderById = async (req, res) => {
  try {
    const userId = req.user?._id ?? req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Forbidden: You do not own this order" });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Development-only order progression for the lab bonus.
export const advanceOrderStatus = async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.sendStatus(404);
  }

  try {
    const userId = req.user?._id ?? req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.paymentStatus !== "PAID") {
      return res.status(409).json({ success: false, message: "Only paid orders can progress" });
    }

    const nextStatus = orderStatusProgression[orderStatusProgression.indexOf(order.status) + 1];
    if (!nextStatus || status !== nextStatus) {
      return res.status(400).json({ success: false, message: "Invalid order status progression" });
    }

    order.status = nextStatus;
    await order.save();
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Advance order status error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
