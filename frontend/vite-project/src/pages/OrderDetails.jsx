import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderByIdApi } from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getOrderByIdApi(id);
      setOrder(response.data.order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      const msg = err.response?.data?.message || 'Failed to load order details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>⚠️ {error || 'Order not found.'}</p>
          <button onClick={() => navigate('/orders')} style={styles.backBtn}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <button onClick={() => navigate('/orders')} style={styles.backLinkBtn}>
            ← Back to Orders
          </button>
          <h1 style={styles.title}>Order Details</h1>
          <p style={styles.subtitle}>Order #{order._id}</p>
        </div>

        <div style={styles.badgesCol}>
          <span style={styles.dateText}>{formatDate(order.createdAt)}</span>
          <div style={styles.badgeRow}>
            <span
              style={{
                ...styles.badge,
                backgroundColor:
                  order.status === 'DELIVERED'
                    ? '#E7F3EB'
                    : ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(order.status)
                    ? '#F4EDE4'
                    : '#FAF0D7',
                color:
                  order.status === 'DELIVERED'
                    ? '#1E5E35'
                    : ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(order.status)
                    ? '#4A2E1B'
                    : '#7A5C0A',
                border: '1px solid #DDD0BF',
              }}
            >
              Order: {order.status}
            </span>

            <span
              style={{
                ...styles.badge,
                backgroundColor: order.paymentStatus === 'PAID' ? '#E7F3EB' : '#FBF0EF',
                color: order.paymentStatus === 'PAID' ? '#1E5E35' : '#992222',
                border: '1px solid #DDD0BF',
              }}
            >
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Items List Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Items Ordered</h2>
          <div style={styles.itemsList}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={styles.itemRow}>
                {item.image && (
                  <img src={item.image} alt={item.name} style={styles.itemImg} />
                )}
                <div style={styles.itemDetails}>
                  <span style={styles.itemName}>{item.name}</span>
                  <span style={styles.itemMeta}>
                    ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                  </span>
                </div>
                <div style={styles.itemSubtotal}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.divider} />

          <div style={styles.totalRow}>
            <span>Total Amount Paid</span>
            <span style={styles.totalVal}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Shipping & Payment Details Side Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Shipping Details</h2>
          <div style={styles.infoBox}>
            <p style={styles.infoLine}>
              <strong>Name:</strong> {order.shippingAddress?.fullName}
            </p>
            <p style={styles.infoLine}>
              <strong>Phone:</strong> {order.shippingAddress?.phone}
            </p>
            <p style={styles.infoLine}>
              <strong>Address:</strong> {order.shippingAddress?.addressLine1}
            </p>
            <p style={styles.infoLine}>
              <strong>City:</strong> {order.shippingAddress?.city}
            </p>
            <p style={styles.infoLine}>
              <strong>State:</strong> {order.shippingAddress?.state}
            </p>
            <p style={styles.infoLine}>
              <strong>Pincode:</strong> {order.shippingAddress?.pincode}
            </p>
          </div>

          {order.razorpayOrderId && (
            <>
              <div style={styles.divider} />
              <h3 style={styles.subTitle}>Payment Reference</h3>
              <p style={styles.infoLineSmall}>
                <strong>Razorpay Order ID:</strong> {order.razorpayOrderId}
              </p>
              {order.razorpayPaymentId && (
                <p style={styles.infoLineSmall}>
                  <strong>Razorpay Payment ID:</strong> {order.razorpayPaymentId}
                </p>
              )}
            </>
          )}

          <div style={styles.actionButtons}>
            <Link to="/orders" style={styles.primaryBtn}>
              View My Orders
            </Link>
            <Link to="/products" style={styles.secondaryBtn}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 20px 48px 20px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  backLinkBtn: {
    background: 'none',
    border: 'none',
    color: '#6F3E22',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 4px 0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: '#6E6259',
    fontSize: '15px',
    margin: 0,
  },
  badgesCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  dateText: {
    fontSize: '14px',
    color: '#6E6259',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#181513',
    marginBottom: '16px',
    borderBottom: '1px solid #F0E8DE',
    paddingBottom: '10px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  itemImg: {
    width: '54px',
    height: '54px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #E6DED4',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#181513',
  },
  itemMeta: {
    fontSize: '14px',
    color: '#6E6259',
  },
  itemSubtotal: {
    fontSize: '16px',
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
  totalVal: {
    color: '#6F3E22',
  },
  infoBox: {
    fontSize: '14px',
    color: '#382921',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  infoLine: {
    margin: 0,
  },
  subTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#181513',
    margin: '0 0 8px 0',
  },
  infoLineSmall: {
    fontSize: '13px',
    color: '#6E6259',
    margin: '0 0 4px 0',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
  },
  primaryBtn: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
  },
  secondaryBtn: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#F4EDE4',
    color: '#382921',
    border: '1px solid #DDD0BF',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
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
  backBtn: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
