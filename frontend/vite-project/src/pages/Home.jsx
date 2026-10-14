import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (selectedCategory !== 'All Categories') {
          params.category = selectedCategory;
        }
        const response = await getProducts(params);
        setProducts(response.data.products || []);
      } catch (err) {
        console.error('Error loading products for Home page:', err);
        setError('Failed to load items. Please make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [selectedCategory]);

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Hero Welcome Banner */}
      <section style={styles.heroBanner}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome back, {user.fullName}! 👋</h1>
          <p style={styles.heroSubtitle}>
            Discover trending electronics, fashion, books, and home essentials at unbeatable prices.
          </p>

          <div style={styles.profileBadgeGroup}>
            <span style={styles.profileBadge}>📧 {user.email}</span>
            <span style={styles.profileBadge}>📞 {user.phone}</span>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <Link to="/products" style={styles.viewAllLink}>
            View All Products &rarr;
          </Link>
        </div>

        <div style={styles.categoryPills}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={
                selectedCategory === cat
                  ? styles.categoryPillActive
                  : styles.categoryPill
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Items Grid Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          {selectedCategory === 'All Categories'
            ? 'Featured Products'
            : `${selectedCategory} Collection`}
        </h2>

        {loading && (
          <div style={styles.statusBox}>
            <p style={styles.statusText}>Loading catalogue items...</p>
          </div>
        )}

        {!loading && error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={styles.statusBox}>
            <p style={styles.emptyText}>No products available in this category.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div style={styles.grid}>
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px 48px 20px',
    textAlign: 'left',
  },
  heroBanner: {
    background: 'linear-gradient(135deg, #181513 0%, #3D2619 50%, #543824 100%)',
    borderRadius: '16px',
    padding: '36px 32px',
    color: '#FFFFFF',
    marginBottom: '32px',
    boxShadow: '0 12px 28px -6px rgba(45, 30, 20, 0.22)',
    border: '1px solid #4A2E1B',
  },
  heroContent: {
    maxWidth: '700px',
  },
  heroTitle: {
    fontSize: '30px',
    fontWeight: '800',
    margin: '0 0 10px 0',
    letterSpacing: '-0.5px',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#EBE1D3',
    margin: '0 0 20px 0',
    lineHeight: '1.5',
  },
  profileBadgeGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  profileBadge: {
    backgroundColor: 'rgba(244, 237, 228, 0.16)',
    color: '#F8F5F0',
    fontSize: '13px',
    fontWeight: '600',
    padding: '6px 14px',
    borderRadius: '20px',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(244, 237, 228, 0.22)',
  },
  section: {
    marginBottom: '36px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 16px 0',
    letterSpacing: '-0.3px',
  },
  viewAllLink: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6F3E22',
    textDecoration: 'none',
  },
  categoryPills: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    color: '#6E6259',
    border: '1px solid #DDD0BF',
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  categoryPillActive: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: '1px solid #181513',
    padding: '8px 18px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(24, 21, 19, 0.25)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  statusBox: {
    textAlign: 'center',
    padding: '48px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E6DED4',
  },
  statusText: {
    fontSize: '16px',
    color: '#6E6259',
    fontWeight: '600',
    margin: 0,
  },
  emptyText: {
    fontSize: '16px',
    color: '#96887D',
    fontWeight: '600',
    margin: 0,
  },
  errorBox: {
    textAlign: 'center',
    padding: '32px 20px',
    backgroundColor: '#FBF0EF',
    borderRadius: '12px',
    border: '1px solid #F3D2CF',
  },
  errorText: {
    fontSize: '15px',
    color: '#992222',
    fontWeight: '600',
    margin: 0,
  },
};

export default Home;
