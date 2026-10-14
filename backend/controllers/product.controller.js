import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, message: "Price must be greater than 0" });
    }

    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ success: false, message: "Stock cannot be negative" });
    }

    const product = await Product.create({
      name,
      description,
      price: numericPrice,
      category,
      image,
      stock: numericStock
    });

    return res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const query = {};

    if (search && typeof search === "string" && search.trim() !== "") {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.name = { $regex: escapedSearch, $options: "i" };
    }

    if (category && typeof category === "string" && category.trim() !== "" && category.trim().toLowerCase() !== "all" && category.trim().toLowerCase() !== "all categories") {
      const escapedCategory = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.category = { $regex: `^${escapedCategory}$`, $options: "i" };
    }

    const products = await Product.find(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
