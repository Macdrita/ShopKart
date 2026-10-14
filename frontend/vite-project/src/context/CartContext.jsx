import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCart,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi,
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await getCart();
      if (response.data.success && response.data.cart) {
        setCartItems(response.data.cart);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Unable to load your cart.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    try {
      const response = await addToCartApi(productId);
      if (response.data.success && response.data.cart) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: response.data.message || 'Product added to cart' };
    } catch (err) {
      if (err.response?.status === 401) {
        return { success: false, message: 'Please log in to add products to your cart.' };
      }
      const msg = err.response?.data?.message || 'Failed to add product to cart.';
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await updateCartQuantityApi(productId, quantity);
      if (response.data.success && response.data.cart) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: response.data.message || 'Cart updated' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity.';
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await removeFromCartApi(productId);
      if (response.data.success && response.data.cart) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: response.data.message || 'Product removed from cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove product from cart.';
      return { success: false, message: msg };
    }
  };

  const clearCart = () => setCartItems([]);

  // Derived values
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const qty = item.quantity || 0;
    return sum + price * qty;
  }, 0);

  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        subtotal,
        totalCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
