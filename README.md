# ShopKart

ShopKart is a full-stack online shopping application built with the MERN stack. Customers can browse and search products, create an account, manage a wishlist and shopping cart, and complete checkout with Razorpay. The React frontend communicates with an Express API backed by MongoDB.

## Features

- Customer registration, login, and protected account pages
- Product browsing, search, category filtering, and product details
- Shopping cart and wishlist management
- Checkout and Razorpay payment verification
- Order history and order details
- Sample products are added to MongoDB automatically when the backend starts

## Technology

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Payments:** Razorpay

## Requirements

- Node.js and npm
- A MongoDB connection string
- Razorpay API keys to use payment checkout

## Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` with your MongoDB connection string and secrets:

   ```env
   dbUrl=mongodb://127.0.0.1:27017
   MONGO_DB_NAME=shopkart
   JWT_SECRET=replace-with-a-long-random-secret
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   ```

   `dbUrl` is required to start the backend. The database name defaults to `shopkart` if `MONGO_DB_NAME` is omitted. Razorpay keys are needed for payment checkout.

3. Install frontend dependencies:

   ```bash
   cd frontend/vite-project
   npm install
   ```

## Run locally

After completing setup, start the backend in one terminal:

```bash
cd backend
npm start
```

Start the frontend in a second terminal:

```bash
cd frontend/vite-project
npm run dev
```

Open the frontend at `http://localhost:5173`. The backend listens on `http://localhost:8005`, which is the API URL configured in the frontend.

## Useful scripts

Run these from `frontend/vite-project`:

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Run these from `backend`:

```bash
npm start
npm run dev
```
