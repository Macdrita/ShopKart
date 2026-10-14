import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, category, onCategoryChange }) => {
  return (
    <div style={styles.container}>
      <div style={styles.searchWrapper}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          style={styles.searchInput}
        />
      </div>

      <div style={styles.selectWrapper}>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={styles.categorySelect}
        >
          <option value="All Categories">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchWrapper: {
    flex: '1',
    minWidth: '240px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #DDD0BF',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#181513',
    boxSizing: 'border-box',
    boxShadow: '0 2px 6px rgba(45, 30, 20, 0.04)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  selectWrapper: {
    minWidth: '180px',
  },
  categorySelect: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '1px solid #DDD0BF',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#181513',
    cursor: 'pointer',
    boxSizing: 'border-box',
    boxShadow: '0 2px 6px rgba(45, 30, 20, 0.04)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
};

export default SearchBar;
