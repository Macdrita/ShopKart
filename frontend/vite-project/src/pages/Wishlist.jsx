import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';
import { useWishlist } from '../context/useWishlist';

export default function Wishlist() {
  const { refreshWishlistCount } = useWishlist();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
      setError("Something went wrong. We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((current) => current.filter((item) => item._id !== productId));
      await refreshWishlistCount();
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      alert('Unable to remove product from wishlist. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>Something went wrong.</p>
          <p style={styles.errorSubtext}>We couldn't load your wishlist.</p>
          <button onClick={fetchWishlist} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>❤️</div>
          <h2 style={styles.emptyTitle}>Your wishlist is empty</h2>
          <p style={styles.emptySubtitle}>
            Save products you love and find them here later.
          </p>
          <Link to="/products" style={styles.browseButton}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Wishlist</h1>
        <p style={styles.countText}>
          {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
        </p>
      </div>

      <div style={styles.grid}>
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            removing={removingId === product._id}
          />
        ))}
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
  header: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px',
  },
  countText: {
    fontSize: '15px',
    color: '#6E6259',
    fontWeight: '500',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
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
    fontSize: '18px',
    fontWeight: '700',
    color: '#992222',
    margin: '0 0 4px 0',
  },
  errorSubtext: {
    fontSize: '14px',
    color: '#8E2525',
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
    transition: 'background-color 0.2s ease',
  },
};
