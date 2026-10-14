import React, { useState, useEffect } from 'react';
import { getProducts, api } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data?.wishlist) {
        const ids = res.data.wishlist.map((item) => item._id);
        setWishlistIds(new Set(ids));
      }
    } catch (err) {
      console.error('Error fetching user wishlist:', err);
    }
  };

  const fetchProductList = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      if (category && category !== 'All Categories') {
        params.category = category;
      }

      const [response] = await Promise.all([
        getProducts(params),
        fetchWishlist(),
      ]);

      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductList();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, category]);

  const handleWishlistChange = (productId, isSaved) => {
    setWishlistIds((prev) => {
      const updated = new Set(prev);
      if (isSaved) {
        updated.add(productId);
      } else {
        updated.delete(productId);
      }
      return updated;
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Products</h1>
        <p style={styles.subtitle}>Discover the best deals on top quality ShopKart items.</p>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        category={category}
        onCategoryChange={setCategory}
      />

      {/* Loading State */}
      {loading && (
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={fetchProductList} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div style={styles.statusBox}>
          <p style={styles.emptyTitle}>No products found.</p>
          <p style={styles.emptySubtitle}>Try adjusting your search terms or category filter.</p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && products.length > 0 && (
        <div style={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initialIsSaved={wishlistIds.has(product._id)}
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
  subtitle: {
    fontSize: '15px',
    color: '#6E6259',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  statusBox: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E6DED4',
    marginTop: '20px',
    boxShadow: '0 2px 8px rgba(45, 30, 20, 0.04)',
  },
  statusText: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6E6259',
    margin: 0,
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#181513',
    margin: '0 0 6px 0',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#96887D',
    margin: 0,
  },
  errorBox: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#FBF0EF',
    borderRadius: '12px',
    border: '1px solid #F3D2CF',
    marginTop: '20px',
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
};

export default Products;
