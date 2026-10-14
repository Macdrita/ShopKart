import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/useWishlist';

const ProductCard = ({ product, initialIsSaved = false, onWishlistChange }) => {
  const { _id, name, price, category, image, stock } = product;
  const { cartItems, addToCart } = useCart();
  const { refreshWishlistCount } = useWishlist();
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const existingCartItem = cartItems.find((item) => item.product?._id === _id);
  const cartQty = existingCartItem ? existingCartItem.quantity : 0;

  const handleAddWishlist = async () => {
    setWishlistLoading(true);
    try {
      await api.post(`/wishlist/${_id}`);
      setIsSaved(true);
      await refreshWishlistCount();
      if (onWishlistChange) onWishlistChange(_id, true);
    } catch (err) {
      if (err.response?.status === 409) {
        setIsSaved(true);
        await refreshWishlistCount();
        if (onWishlistChange) onWishlistChange(_id, true);
      } else {
        alert('Unable to save product. Please try again.');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveWishlist = async () => {
    setWishlistLoading(true);
    try {
      await api.delete(`/wishlist/${_id}`);
      setIsSaved(false);
      await refreshWishlistCount();
      if (onWishlistChange) onWishlistChange(_id, false);
    } catch (err) {
      console.error('Wishlist remove failed:', err);
      alert('Unable to remove product from wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (stock <= 0) {
      alert('This item is currently out of stock.');
      return;
    }
    setCartLoading(true);
    const result = await addToCart(_id);
    setCartLoading(false);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img
          src={image}
          alt={name}
          style={styles.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
          }}
        />
        {category && <span style={styles.categoryBadge}>{category}</span>}
        <button
          type="button"
          onClick={isSaved ? handleRemoveWishlist : handleAddWishlist}
          disabled={wishlistLoading}
          style={{
            ...styles.heartBtn,
            ...(isSaved ? styles.heartBtnSaved : {}),
          }}
          title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {wishlistLoading ? '⏳' : isSaved ? '♥' : '♡'}
        </button>
      </div>

      <div style={styles.content}>
        <h3 style={styles.name}>{name}</h3>

        <div style={styles.priceRow}>
          <span style={styles.price}>₹{price ? price.toLocaleString('en-IN') : 0}</span>
          <span style={stock > 0 ? styles.stockIn : styles.stockOut}>
            {stock > 0 ? `${stock} units left` : 'Out of stock'}
          </span>
        </div>

        <div style={styles.actionsRow}>
          <Link to={`/products/${_id}`} style={styles.viewButton}>
            View Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={cartLoading || stock <= 0}
            style={{
              ...styles.cartBtn,
              ...(cartQty > 0 ? styles.cartBtnInCart : {}),
              ...(stock <= 0 || cartLoading ? styles.cartBtnDisabled : {}),
            }}
          >
            {cartLoading
              ? 'Adding...'
              : cartQty > 0
              ? `Add Another (${cartQty})`
              : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E6DED4',
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(45, 30, 20, 0.05), 0 1px 3px rgba(45, 30, 20, 0.03)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#F5EFEB',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(24, 21, 19, 0.85)',
    color: '#F8F5F0',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    backdropFilter: 'blur(4px)',
  },
  heartBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    color: '#786C64',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(45, 30, 20, 0.12)',
    transition: 'all 0.2s ease',
  },
  heartBtnSaved: {
    color: '#8B3A2B',
    backgroundColor: '#F7EBE8',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    justify: 'space-between',
  },
  name: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#181513',
    margin: 0,
    lineHeight: '1.4',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  price: {
    fontSize: '19px',
    fontWeight: '800',
    color: '#6F3E22',
  },
  stockIn: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#275A38',
    backgroundColor: '#EBF3ED',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  stockOut: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#9E3324',
    backgroundColor: '#F9EDEA',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  viewButton: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#F4EDE4',
    color: '#382921',
    border: '1px solid #DDD0BF',
    padding: '10px 14px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '13px',
    textDecoration: 'none',
    flex: 1,
    transition: 'background-color 0.2s ease',
  },
  cartBtn: {
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 14px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: 1,
  },
  cartBtnInCart: {
    backgroundColor: '#4A2E1B',
  },
  cartBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    backgroundColor: '#DDD0BF',
    color: '#8C7D73',
  },
};

export default ProductCard;
