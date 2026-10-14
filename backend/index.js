import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import Product from "./models/product.model.js";

const app = express();
const port = 8005;
let databaseConnection;

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with tactile blue switches and durable aluminum frame.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    stock: 10
  },
  {
    name: "Wireless Headphones",
    description: "Over-ear active noise cancelling Bluetooth headphones with 30h battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    stock: 25
  },
  {
    name: "Cotton T-Shirt",
    description: "100% organic breathable cotton black t-shirt for daily comfort.",
    price: 799,
    category: "Fashion",
    image: "/cotton-tshirt.svg",
    stock: 50
  },
  {
    name: "Running Shoes",
    description: "Lightweight cushioned athletic sneakers designed for high performance running.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    stock: 15
  },
  {
    name: "JavaScript Guide",
    description: "Comprehensive guide to modern JavaScript ES6+ and full-stack development.",
    price: 899,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    stock: 30
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted 350ml matte ceramic mug, microwave and dishwasher safe.",
    price: 499,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    stock: 40
  },
  {
    name: "Smart Watch",
    description: "Fitness smartwatch with heart-rate tracking, notifications, and a bright touchscreen.",
    price: 2499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    stock: 18
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable wireless speaker with rich sound and a long-lasting rechargeable battery.",
    price: 1799,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80",
    stock: 22
  },
  {
    name: "Leather Backpack",
    description: "Everyday backpack with a roomy main compartment and padded laptop sleeve.",
    price: 2199,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    stock: 14
  },
  {
    name: "Classic Denim Jacket",
    description: "Versatile blue denim jacket with a comfortable fit and button-front closure.",
    price: 2799,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=600&q=80",
    stock: 12
  },
  {
    name: "Everyday Sunglasses",
    description: "Lightweight UV-protective sunglasses with a timeless frame.",
    price: 999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
    stock: 30
  },
  {
    name: "Ceramic Plant Pot",
    description: "Minimal ceramic planter that adds a clean, modern touch to any room.",
    price: 699,
    category: "Home",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
    stock: 26
  },
  {
    name: "Desk Lamp",
    description: "Adjustable contemporary desk lamp for focused reading and workspace lighting.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    stock: 16
  },
  {
    name: "Travel Coffee Tumbler",
    description: "Reusable insulated tumbler designed to keep drinks hot or cold on the go.",
    price: 599,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80",
    stock: 35
  },
  {
    name: "The Art of Design",
    description: "An inspiring illustrated book exploring creative thinking and modern design.",
    price: 1199,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    stock: 20
  },
  {
    name: "Everyday Journal",
    description: "A hard-cover lined notebook for notes, plans, and daily reflections.",
    price: 399,
    category: "Books",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80",
    stock: 45
  }
];

async function seedInitialProducts() {
  try {
    const { image: cottonTShirtImage, ...cottonTShirt } = sampleProducts.find(
      ({ name }) => name === "Cotton T-Shirt"
    );
    await Promise.all(sampleProducts.filter(({ name }) => name !== "Cotton T-Shirt").map(({ name, ...product }) =>
      Product.updateOne(
        { name },
        { $setOnInsert: { name, ...product } },
        { upsert: true }
      )
    ));
    await Product.updateOne(
      { name: "Cotton T-Shirt" },
      {
        $set: { image: cottonTShirtImage },
        $setOnInsert: cottonTShirt
      },
      { upsert: true }
    );
    console.log("Ensured sample products are available in the database.");
  } catch (err) {
    console.error("Error auto-seeding products:", err.message);
  }
}

async function connectDatabase() {
  const databaseUrl = process.env.dbUrl || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("MongoDB connection is not configured. Set dbUrl or DATABASE_URL.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!databaseConnection) {
    databaseConnection = mongoose.connect(databaseUrl, {
      dbName: process.env.MONGO_DB_NAME || "shopkart",
      serverSelectionTimeoutMS: 10000
    }).then(async () => {
      console.log(`Connected to persistent MongoDB database "${mongoose.connection.name}".`);
      await seedInitialProducts();
    }).catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }

  await databaseConnection;
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "ShopKart Customer & Product API Service" });
});

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable because the database is not configured or reachable."
    });
  }
});

app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`Server started at port ${port}`);
  });
}

export default app;

if (process.env.VERCEL !== "1") {
  startServer().catch((error) => {
    console.error("Backend startup failed; server was not started:", error.message);
    process.exitCode = 1;
  });
}