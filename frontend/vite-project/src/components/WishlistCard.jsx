import React from 'react';
import { Link } from 'react-router-dom';

const WishlistCard = ({ product, onRemove, removing }) => {
  const { _id, name, price, category, image, stock } = product;

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
            onClick={() => onRemove(_id)}
            disabled={removing}
            style={styles.removeButton}
          >
            {removing ? 'Removing...' : 'Remove ♥'}
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
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
    justifyContent: 'space-between',
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
    marginTop: '8px',
  },
  viewButton: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    padding: '10px 14px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '13px',
    textDecoration: 'none',
    flex: 1,
    transition: 'background-color 0.2s ease',
  },
  removeButton: {
    backgroundColor: '#F4EDE4',
    color: '#9E3324',
    border: '1px solid #DDD0BF',
    borderRadius: '6px',
    padding: '10px 14px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flex: '0 0 auto',
  },
};

export default WishlistCard;
