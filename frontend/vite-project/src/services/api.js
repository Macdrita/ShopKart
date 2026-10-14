import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shopkart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = API;

export const registerCustomer = (data) => API.post('/customers/register', data);
export const loginCustomer = (data) => API.post('/customers/login', data);
export const getCustomerProfile = () => API.get('/customers/me');
export const logoutCustomer = () => API.post('/customers/logout');

export const getProducts = (params) => API.get('/products', { params });
export const getProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const getWishlist = () => API.get('/wishlist');

// Cart APIs
export const getCart = () => API.get('/cart');
export const addToCartApi = (productId) => API.post(`/cart/${productId}`);
export const updateCartQuantityApi = (productId, quantity) =>
  API.patch(`/cart/${productId}`, { quantity });
export const removeFromCartApi = (productId) => API.delete(`/cart/${productId}`);

// Order APIs
export const createPaymentOrderApi = (shippingAddress) =>
  API.post('/orders/create-payment-order', { shippingAddress });
export const verifyPaymentApi = (data) => API.post('/orders/verify-payment', data);
export const getUserOrdersApi = () => API.get('/orders');
export const getOrderByIdApi = (id) => API.get(`/orders/${id}`);
export const updateOrderStatusApi = (id, status) => API.patch(`/orders/${id}/status`, { status });

export default API;
