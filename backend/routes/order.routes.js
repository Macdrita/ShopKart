import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  advanceOrderStatus
} from "../controllers/order.controller.js";
import { protectCustomer } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectCustomer);

router.post("/create-payment-order", createPaymentOrder);
router.post("/", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getUserOrders);
router.patch("/:id/status", advanceOrderStatus);
router.get("/:id", getOrderById);

export default router;
