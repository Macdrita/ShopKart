import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    subtotal,
    totalCount,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCart();

  if (loading) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>Unable to load your cart.</p>
          <button onClick={fetchCart} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🛒</div>
          <h2 style={styles.emptyTitle}>Your cart is empty</h2>
          <p style={styles.emptySubtitle}>
            Looks like you haven't added anything yet.
          </p>
          <Link to="/products" style={styles.browseButton}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handleProceedCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Cart</h1>

      <div style={styles.layout}>
        <div style={styles.itemsList}>
          {cartItems.map((item) => (
            <CartItem
              key={item.product._id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <div style={styles.summaryCard}>
          <h2 style={styles.summaryTitle}>Order Summary</h2>
          <div style={styles.summaryRow}>
            <span>Items</span>
            <span style={styles.summaryVal}>{totalCount}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Subtotal</span>
            <span style={styles.summaryVal}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div style={styles.divider} />

          <button onClick={handleProceedCheckout} style={styles.checkoutBtn}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '24px 20px 48px 20px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 24px 0',
    letterSpacing: '-0.3px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 20px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '15px',
    color: '#6E6259',
    marginBottom: '12px',
  },
  summaryVal: {
    fontWeight: '700',
    color: '#181513',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E6DED4',
    margin: '16px 0',
  },
  checkoutBtn: {
    width: '100%',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  statusContainer: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '0 20px',
  },
  statusBox: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E6DED4',
  },
  statusText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6E6259',
    margin: 0,
  },
  errorBox: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#FBF0EF',
    borderRadius: '12px',
    border: '1px solid #F3D2CF',
  },
  errorText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#992222',
    margin: '0 0 16px 0',
  },
  retryButton: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  emptyContainer: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '0 20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E6DED4',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    fontSize: '15px',
    color: '#6E6259',
    margin: '0 0 24px 0',
  },
  browseButton: {
    display: 'inline-block',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    textDecoration: 'none',
  },
};
