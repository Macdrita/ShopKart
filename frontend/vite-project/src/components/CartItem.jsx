import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { product, quantity } = item;
  const [updating, setUpdating] = useState(false);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;
  const itemTotal = (price || 0) * (quantity || 1);

  const handleDecrease = async () => {
    if (quantity <= 1) return;
    setUpdating(true);
    await onUpdateQuantity(_id, quantity - 1);
    setUpdating(false);
  };

  const handleIncrease = async () => {
    if (quantity >= stock) return;
    setUpdating(true);
    await onUpdateQuantity(_id, quantity + 1);
    setUpdating(false);
  };

  const handleRemoveItem = async () => {
    setUpdating(true);
    await onRemove(_id);
    setUpdating(false);
  };

  return (
    <div style={styles.card}>
      <img
        src={image}
        alt={name}
        style={styles.image}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://via.placeholder.com/150?text=Product';
        }}
      />

      <div style={styles.details}>
        <div>
          {category && <span style={styles.categoryBadge}>{category}</span>}
          <Link to={`/products/${_id}`} style={styles.nameLink}>
            <h3 style={styles.name}>{name}</h3>
          </Link>
          <p style={styles.price}>₹{price ? price.toLocaleString('en-IN') : 0} each</p>
        </div>

        <div style={styles.controlsRow}>
          <div style={styles.qtyBox}>
            <button
              type="button"
              onClick={handleDecrease}
              disabled={quantity <= 1 || updating}
              style={{
                ...styles.qtyBtn,
                ...(quantity <= 1 || updating ? styles.qtyBtnDisabled : {}),
              }}
            >
              -
            </button>
            <span style={styles.qtyText}>{quantity}</span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={quantity >= stock || updating}
              style={{
                ...styles.qtyBtn,
                ...(quantity >= stock || updating ? styles.qtyBtnDisabled : {}),
              }}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRemoveItem}
            disabled={updating}
            style={styles.removeBtn}
          >
            {updating ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>

      <div style={styles.subtotalSection}>
        <span style={styles.subtotalLabel}>Total</span>
        <span style={styles.subtotalValue}>₹{itemTotal.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '12px',
    padding: '16px',
    gap: '20px',
    boxShadow: '0 2px 8px rgba(45, 30, 20, 0.04)',
  },
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    backgroundColor: '#F5EFEB',
    flexShrink: 0,
  },
  details: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '8px',
  },
  categoryBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#4A2E1B',
    backgroundColor: '#F4EDE4',
    border: '1px solid #DDD0BF',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    marginBottom: '4px',
    width: 'fit-content',
  },
  nameLink: {
    textDecoration: 'none',
  },
  name: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#181513',
    margin: '0 0 4px 0',
  },
  price: {
    fontSize: '14px',
    color: '#6E6259',
    margin: 0,
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '6px',
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #DDD0BF',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  qtyBtn: {
    backgroundColor: '#F4EDE4',
    border: 'none',
    width: '32px',
    height: '32px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    color: '#382921',
    transition: 'background-color 0.2s ease',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    backgroundColor: '#F9F6F0',
    color: '#B5A99F',
  },
  qtyText: {
    width: '36px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '15px',
    color: '#181513',
    backgroundColor: '#FFFFFF',
  },
  removeBtn: {
    backgroundColor: 'transparent',
    color: '#9E3324',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  subtotalSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: '100px',
  },
  subtotalLabel: {
    fontSize: '12px',
    color: '#6E6259',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#6F3E22',
  },
};

export default CartItem;
