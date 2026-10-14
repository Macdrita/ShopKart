import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserOrdersApi, updateOrderStatusApi } from '../services/api';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const statusProgression = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserOrdersApi();
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const advanceOrder = async (order) => {
    const nextStatus = statusProgression[statusProgression.indexOf(order.status) + 1];
    if (!nextStatus) return;

    setStatusError('');
    setUpdatingOrderId(order._id);
    try {
      const response = await updateOrderStatusApi(order._id, nextStatus);
      setOrders((currentOrders) =>
        currentOrders.map((current) =>
          current._id === order._id ? response.data.order : current
        )
      );
    } catch (err) {
      setStatusError(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchOrders} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h2 style={styles.emptyTitle}>You have not placed any orders yet.</h2>
          <p style={styles.emptySubtitle}>Explore our catalog and place your first order today!</p>
          <Link to="/products" style={styles.browseButton}>
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>My Orders</h1>

      <div style={styles.ordersList}>
        {orders.map((order) => (
          <div key={order._id} style={styles.orderCard}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.orderIdLabel}>Order #{order._id}</span>
                <span style={styles.orderDate}>{formatDate(order.createdAt)}</span>
              </div>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor:
                    order.status === 'DELIVERED'
                      ? '#E7F3EB'
                      : ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(order.status)
                      ? '#F4EDE4'
                      : order.status === 'PENDING_PAYMENT'
                      ? '#FAF0D7'
                      : '#F4EDE4',
                  color:
                    order.status === 'DELIVERED'
                      ? '#1E5E35'
                      : ['PLACED', 'CONFIRMED', 'SHIPPED'].includes(order.status)
                      ? '#4A2E1B'
                      : order.status === 'PENDING_PAYMENT'
                      ? '#7A5C0A'
                      : '#382921',
                  border: '1px solid #DDD0BF',
                }}
              >
                {order.status}
              </span>
            </div>

            <div style={styles.progressRow} aria-label={`Order progress: ${order.status}`}>
              {statusProgression.map((status, index) => {
                const active = statusProgression.indexOf(order.status) >= index;
                return (
                  <span
                    key={status}
                    style={{
                      ...styles.progressStep,
                      ...(active ? styles.progressStepActive : {}),
                    }}
                  >
                    {status}
                  </span>
                );
              })}
            </div>

            <div style={styles.itemsSummaryList}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={styles.itemSummaryRow}>
                  <span>
                    {item.name} <strong style={{ color: '#6E6259' }}>× {item.quantity}</strong>
                  </span>
                  <span style={styles.itemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div style={styles.cardFooter}>
              <div style={styles.totalBlock}>
                <span style={styles.totalLabel}>Total: </span>
                <span style={styles.totalAmount}>
                  ₹{order.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => navigate(`/orders/${order._id}`)}
                style={styles.detailsBtn}
              >
                View Details
              </button>
              {import.meta.env.DEV &&
                order.paymentStatus === 'PAID' &&
                statusProgression.indexOf(order.status) < statusProgression.length - 1 && (
                  <button
                    onClick={() => advanceOrder(order)}
                    disabled={updatingOrderId === order._id}
                    style={styles.advanceBtn}
                  >
                    {updatingOrderId === order._id ? 'Updating...' : 'Advance Status'}
                  </button>
                )}
            </div>
            {statusError && <p style={styles.statusError}>{statusError}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '24px 20px 48px 20px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#181513',
    marginBottom: '24px',
    letterSpacing: '-0.3px',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 16px rgba(45, 30, 20, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '14px',
    borderBottom: '1px solid #F0E8DE',
    marginBottom: '16px',
  },
  orderIdLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#181513',
    marginRight: '12px',
  },
  orderDate: {
    fontSize: '14px',
    color: '#6E6259',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  progressRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  progressStep: {
    padding: '5px 10px',
    borderRadius: '16px',
    backgroundColor: '#F4EDE4',
    color: '#6E6259',
    fontSize: '11px',
    fontWeight: '700',
  },
  progressStepActive: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
  },
  itemsSummaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  itemSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: '#382921',
  },
  itemPrice: {
    fontWeight: '700',
    color: '#181513',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '14px',
    borderTop: '1px solid #F0E8DE',
  },
  totalBlock: {
    fontSize: '16px',
  },
  totalLabel: {
    color: '#6E6259',
    fontWeight: '600',
  },
  totalAmount: {
    fontWeight: '800',
    color: '#6F3E22',
    fontSize: '18px',
  },
  detailsBtn: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  advanceBtn: {
    backgroundColor: '#F4EDE4',
    color: '#382921',
    border: '1px solid #DDD0BF',
    padding: '10px 14px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },
  statusError: {
    margin: '12px 0 0',
    color: '#992222',
    fontSize: '14px',
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
  retryButton: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
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
