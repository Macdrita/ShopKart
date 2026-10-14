import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const addToWishlist = async (req, res) => {
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

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const alreadyExists = user.wishlist.some(
      (id) => id && id.toString() === productId.toString()
    );
    if (alreadyExists) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?._id ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name description price category image stock"
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
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

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const exists = user.wishlist.some(
      (id) => id && id.toString() === productId.toString()
    );
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    user.wishlist = user.wishlist.filter(
      (id) => id && id.toString() !== productId.toString()
    );
    await user.save();

    return res.status(200).json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};