import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

export const protectCustomer = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No Token Found" });
    }

    const secret = process.env.JWT_SECRET || "shopkart_secret_jwt_key";
    const decoded = jwt.verify(token, secret);

    const customer = await Customer.findById(decoded.id).select("-password");
    if (!customer) {
      return res.status(401).json({ success: false, message: "Unauthorized - Customer not found" });
    }

    req.user = customer;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ success: false, message: `Unauthorized - ${error.message}` });
  }
};
