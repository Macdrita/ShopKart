import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createPaymentOrderApi, verifyPaymentApi } from '../services/api';

export default function Checkout() {
  const { cartItems, subtotal, loading, error: cartError, fetchCart, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone should contain a valid 10-digit number format';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')?.remove();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => {
        script.remove();
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side validation check
    if (!validateForm()) {
      // Do not call the backend if basic client validation fails
      return;
    }

    setSubmitting(true);
    let checkoutOpened = false;
    try {
      const response = await createPaymentOrderApi({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      const checkoutData = response.data;
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout. Check your connection and try again.');
      }

      let verificationStarted = false;
      const options = {
        key: checkoutData.key,
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        name: 'ShopKart',
        description: `Order #${checkoutData.shopKartOrderId}`,
        order_id: checkoutData.razorpayOrderId,
        handler: async (paymentResponse) => {
          verificationStarted = true;
          try {
            const verifyResponse = await verifyPaymentApi({
              shopKartOrderId: checkoutData.shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            clearCart();
            setOrderSuccess(verifyResponse.data.order);
          } catch (verificationError) {
            setServerError(
              verificationError.response?.data?.message ||
              'Payment verification failed. Your cart has not been cleared.'
            );
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: { color: '#181513' },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            if (!verificationStarted) {
              setServerError('Checkout was closed. Your cart has not been cleared.');
            }
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', ({ error: paymentError }) => {
        setServerError(
          `${paymentError?.description || 'Payment failed.'} Your cart has not been cleared. Please try again.`
        );
        setSubmitting(false);
      });
      paymentObject.open();
      checkoutOpened = true;
    } catch (err) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create order. Please try again.';
      setServerError(msg);
      setSubmitting(false);
    } finally {
      if (!checkoutOpened) {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading checkout details...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>Unable to load checkout.</p>
          <button onClick={fetchCart} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>🎉</div>
          <h2 style={styles.successTitle}>Order Placed Successfully!</h2>
          <p style={styles.successSub}>
            Thank you for your purchase. Your Order ID is:{' '}
            <strong style={{ color: '#6F3E22' }}>{orderSuccess._id}</strong>
          </p>

          <div style={styles.orderSummaryBox}>
            <h3 style={styles.summaryTitle}>Order Details</h3>
            <p>
              <strong>Total Amount:</strong> ₹{orderSuccess.totalAmount?.toLocaleString('en-IN')}
            </p>
            <p>
              <strong>Status:</strong> {orderSuccess.status}
            </p>
            <p>
              <strong>Payment Status:</strong> {orderSuccess.paymentStatus}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <Link to="/orders" style={styles.browseButton}>
              View My Orders
            </Link>
            <Link to="/products" style={{ ...styles.browseButton, backgroundColor: '#f1f5f9', color: '#334155' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <h2 style={styles.emptyTitle}>Your Cart is Empty</h2>
          <p style={styles.emptySubtitle}>Add items to your cart before proceeding to checkout.</p>
          <Link to="/products" style={styles.browseButton}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Checkout</h1>

      {serverError && (
        <div style={styles.serverErrorBox}>
          <span>⚠️ {serverError}</span>
        </div>
      )}

      <div style={styles.layout}>
        {/* Shipping Form */}
        <div style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Shipping Details</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="fullName">
                Full Name <span style={styles.req}>*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  ...styles.input,
                  borderColor: errors.fullName ? '#9E3324' : '#DDD0BF',
                }}
              />
              {errors.fullName && <span style={styles.errorSpan}>{errors.fullName}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="phone">
                Phone <span style={styles.req}>*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                style={{
                  ...styles.input,
                  borderColor: errors.phone ? '#9E3324' : '#DDD0BF',
                }}
              />
              {errors.phone && <span style={styles.errorSpan}>{errors.phone}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="addressLine1">
                Address Line <span style={styles.req}>*</span>
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House No., Street Name, Area"
                style={{
                  ...styles.input,
                  borderColor: errors.addressLine1 ? '#9E3324' : '#DDD0BF',
                }}
              />
              {errors.addressLine1 && <span style={styles.errorSpan}>{errors.addressLine1}</span>}
            </div>

            <div style={styles.rowTwoCols}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="city">
                  City <span style={styles.req}>*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  style={{
                    ...styles.input,
                    borderColor: errors.city ? '#9E3324' : '#DDD0BF',
                  }}
                />
                {errors.city && <span style={styles.errorSpan}>{errors.city}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="state">
                  State <span style={styles.req}>*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  style={{
                    ...styles.input,
                    borderColor: errors.state ? '#9E3324' : '#DDD0BF',
                  }}
                />
                {errors.state && <span style={styles.errorSpan}>{errors.state}</span>}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="pincode">
                Pincode <span style={styles.req}>*</span>
              </label>
              <input
                id="pincode"
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength={6}
                style={{
                  ...styles.input,
                  borderColor: errors.pincode ? '#9E3324' : '#DDD0BF',
                }}
              />
              {errors.pincode && <span style={styles.errorSpan}>{errors.pincode}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitBtn,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Processing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={styles.summaryCard}>
          <h2 style={styles.sectionTitle}>Order Summary</h2>
          <div style={styles.itemsContainer}>
            {cartItems.map((item) => (
              <div key={item.product._id || item.product} style={styles.summaryItemRow}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemName}>{item.product.name}</span>
                  <span style={styles.itemQty}> × {item.quantity}</span>
                </div>
                <span style={styles.itemPrice}>
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.divider} />

          <div style={styles.totalRow}>
            <span>Total</span>
            <span style={styles.totalAmount}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
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
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 24px 0',
    letterSpacing: '-0.3px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    alignItems: 'start',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 20px 0',
    borderBottom: '1px solid #E6DED4',
    paddingBottom: '12px',
  },
  formGroup: {
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  rowTwoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#382921',
    marginBottom: '6px',
  },
  req: {
    color: '#9E3324',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #DDD0BF',
    backgroundColor: '#FCFAF7',
    color: '#181513',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  errorSpan: {
    color: '#9E3324',
    fontSize: '13px',
    marginTop: '4px',
    fontWeight: '500',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '16px',
    marginTop: '12px',
    transition: 'background-color 0.2s',
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  summaryItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '15px',
  },
  itemInfo: {
    color: '#382921',
  },
  itemName: {
    fontWeight: '600',
  },
  itemQty: {
    color: '#6E6259',
    fontWeight: '500',
  },
  itemPrice: {
    fontWeight: '700',
    color: '#181513',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E6DED4',
    margin: '16px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '800',
    color: '#181513',
  },
  totalAmount: {
    color: '#6F3E22',
  },
  serverErrorBox: {
    backgroundColor: '#FBF0EF',
    border: '1px solid #F3D2CF',
    color: '#992222',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '600',
  },
  statusContainer: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '0 20px',
  },
  statusBox: {
    textAlign: 'center',
    padding: '48px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E6DED4',
  },
  statusText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6E6259',
  },
  emptyTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#181513',
    marginBottom: '8px',
  },
  emptySubtitle: {
    color: '#6E6259',
    marginBottom: '20px',
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
    marginBottom: '16px',
  },
  retryButton: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  successContainer: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '0 20px',
  },
  successCard: {
    textAlign: 'center',
    padding: '40px 24px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E6DED4',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  successIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 8px 0',
  },
  successSub: {
    fontSize: '15px',
    color: '#6E6259',
    marginBottom: '24px',
  },
  orderSummaryBox: {
    backgroundColor: '#F7F2EB',
    border: '1px solid #E6DED4',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'left',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#382921',
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
