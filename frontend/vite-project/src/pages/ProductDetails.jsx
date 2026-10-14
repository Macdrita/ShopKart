import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/useWishlist';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { refreshWishlistCount } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartAdding, setCartAdding] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getProductById(id);
        if (response.data.success && response.data.product) {
          setProduct(response.data.product);
          try {
            const wishlistRes = await api.get('/wishlist');
            if (wishlistRes.data?.wishlist) {
              const inWishlist = wishlistRes.data.wishlist.some((item) => item._id === id);
              setIsSaved(inWishlist);
            }
          } catch (wErr) {
            console.error('Error checking wishlist status:', wErr);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Something went wrong while loading the product details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    setCartAdding(true);
    const res = await addToCart(product._id);
    setCartAdding(false);

    if (res.success) {
      setAddedNotice(true);
      setTimeout(() => {
        setAddedNotice(false);
      }, 2500);
    } else {
      alert(res.message);
    }
  };

  const handleWishlistToggle = async () => {
    if (!id) return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/wishlist/${id}`);
        setIsSaved(false);
      } else {
        await api.post(`/wishlist/${id}`);
        setIsSaved(true);
      }
      await refreshWishlistCount();
    } catch (err) {
      if (err.response?.status === 409 && !isSaved) {
        setIsSaved(true);
        await refreshWishlistCount();
      } else if (err.response?.status === 404 && isSaved) {
        setIsSaved(false);
        await refreshWishlistCount();
      } else {
        alert('Unable to update wishlist. Please try again.');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={styles.statusContainer}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error || 'Product not found.'}</p>
          <Link to="/products" style={styles.backButton}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;

  return (
    <div style={styles.container}>
      <Link to="/products" style={styles.breadcrumbLink}>
        &larr; Back to Products
      </Link>

      <div style={styles.card}>
        <div style={styles.imageSection}>
          <img
            src={image}
            alt={name}
            style={styles.image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/500x400?text=Product+Image';
            }}
          />
        </div>

        <div style={styles.infoSection}>
          <span style={styles.categoryBadge}>{category}</span>
          <h1 style={styles.title}>{name}</h1>
          <p style={styles.price}>₹{price ? price.toLocaleString('en-IN') : 0}</p>

          <div style={styles.stockRow}>
            <span style={styles.stockLabel}>Availability:</span>
            <span style={stock > 0 ? styles.stockIn : styles.stockOut}>
              {stock > 0 ? `In Stock (${stock} units left)` : 'Out of Stock'}
            </span>
          </div>

          <div style={styles.divider} />

          <div style={styles.descriptionGroup}>
            <h3 style={styles.descriptionTitle}>Description</h3>
            <p style={styles.descriptionText}>{description}</p>
          </div>

          {addedNotice && (
            <div style={styles.noticeBox}>
              ✓ Added to cart successfully!
            </div>
          )}

          <div style={styles.actionRow}>
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0 || cartAdding}
              style={stock > 0 ? styles.cartButton : styles.cartButtonDisabled}
            >
              {cartAdding ? 'Adding...' : stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={saveLoading}
              style={{
                ...styles.wishlistButton,
                ...(isSaved ? styles.wishlistButtonSaved : {}),
                ...(saveLoading ? styles.wishlistButtonDisabled : {}),
              }}
            >
              {saveLoading ? 'Saving...' : isSaved ? 'Remove Wishlist' : 'Save to Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 20px 48px 20px',
    textAlign: 'left',
  },
  breadcrumbLink: {
    display: 'inline-block',
    marginBottom: '20px',
    color: '#6F3E22',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E6DED4',
    overflow: 'hidden',
    boxShadow: '0 6px 20px rgba(45, 30, 20, 0.06)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '32px',
    padding: '32px',
  },
  imageSection: {
    width: '100%',
    height: '360px',
    backgroundColor: '#F5EFEB',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  categoryBadge: {
    display: 'inline-block',
    backgroundColor: '#F4EDE4',
    color: '#4A2E1B',
    border: '1px solid #DDD0BF',
    fontSize: '12px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    alignSelf: 'flex-start',
    marginBottom: '12px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#181513',
    margin: '0 0 12px 0',
    lineHeight: '1.3',
    letterSpacing: '-0.3px',
  },
  price: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#6F3E22',
    margin: '0 0 16px 0',
  },
  stockRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  stockLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6E6259',
  },
  stockIn: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#275A38',
  },
  stockOut: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#9E3324',
  },
  divider: {
    height: '1px',
    backgroundColor: '#E6DED4',
    margin: '0 0 20px 0',
  },
  descriptionGroup: {
    marginBottom: '28px',
  },
  descriptionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#181513',
    margin: '0 0 8px 0',
  },
  descriptionText: {
    fontSize: '15px',
    color: '#5C4D43',
    lineHeight: '1.6',
    margin: 0,
  },
  noticeBox: {
    backgroundColor: '#EBF3ED',
    color: '#275A38',
    border: '1px solid #C8E2CF',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '600',
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  cartButtonDisabled: {
    backgroundColor: '#DDD0BF',
    color: '#8C7D73',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'not-allowed',
  },
  wishlistButton: {
    backgroundColor: '#F4EDE4',
    color: '#382921',
    border: '1px solid #DDD0BF',
    padding: '14px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  wishlistButtonSaved: {
    backgroundColor: '#F7EBE8',
    borderColor: '#EBCAC4',
    color: '#8B3A2B',
  },
  wishlistButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  statusContainer: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '0 20px',
  },
  statusBox: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E6DED4',
  },
  statusText: {
    fontSize: '18px',
    color: '#6E6259',
    fontWeight: '600',
    margin: 0,
  },
  errorBox: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#FBF0EF',
    borderRadius: '12px',
    border: '1px solid #F3D2CF',
  },
  errorText: {
    fontSize: '16px',
    color: '#992222',
    fontWeight: '600',
    marginBottom: '16px',
  },
  backButton: {
    display: 'inline-block',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
  },
};

export default ProductDetails;
