import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /cart/:productId
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const cartIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (cartIndex > -1) {
      const currentQty = user.cart[cartIndex].quantity || 1;
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Quantity exceeds available stock (${product.stock}).`
        });
      }
      user.cart[cartIndex].quantity = currentQty + 1;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock."
        });
      }
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    const updatedCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user?._id ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({ success: false, message: "Server error fetching cart" });
  }
};

// PATCH /cart/:productId
export const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?._id ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (typeof quantity !== "number" || isNaN(quantity)) {
      return res.status(400).json({ success: false, message: "Quantity must be a valid number" });
    }

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity cannot be less than 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity exceeds available stock (${product.stock})`
      });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const cartItem = user.cart.find(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Product not in cart" });
    }

    cartItem.quantity = quantity;
    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    const updatedCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cart) {
      user.cart = [];
    }

    const exists = user.cart.some(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    user.cart = user.cart.filter(
      (item) => item.product && item.product.toString() !== productId.toString()
    );

    await user.save();

    await user.populate({
      path: "cart.product",
      select: "name description price category image stock"
    });

    const updatedCart = (user.cart || []).filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updatedCart
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};