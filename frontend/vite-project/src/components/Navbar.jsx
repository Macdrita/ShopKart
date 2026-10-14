import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/useWishlist';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getLinkStyle = ({ isActive }) => ({
    ...styles.link,
    ...(isActive ? styles.activeLink : {}),
  });

  const getCartLinkStyle = ({ isActive }) => ({
    ...styles.cartLink,
    ...(isActive ? styles.activeCartLink : {}),
  });

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to={user ? "/home" : "/login"} style={styles.brand}>
          🛒 ShopKart
        </Link>
        <div style={styles.links}>
          {user ? (
            <>
              <NavLink
                to="/home"
                end
                style={(state) => ({
                  ...getLinkStyle(state),
                  ...(pathname === '/' ? styles.activeLink : {}),
                })}
              >
                Home
              </NavLink>
              <NavLink to="/products" style={getLinkStyle}>Products</NavLink>
              <NavLink to="/wishlist" style={getLinkStyle}>
                {wishlistCount === null ? 'Wishlist' : `Wishlist (${wishlistCount})`}
              </NavLink>
              <NavLink to="/orders" style={getLinkStyle}>My Orders</NavLink>
              <NavLink to="/cart" end style={getCartLinkStyle}>
                Cart ({totalCount})
              </NavLink>
              <span style={styles.userText}>Hi, {user.fullName}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={getLinkStyle}>Login</NavLink>
              <NavLink to="/register" style={getLinkStyle}>Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E6DED4',
    padding: '14px 24px',
    marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(45, 30, 20, 0.04)',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#181513',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  link: {
    color: '#6E6259',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'color 0.2s ease',
  },
  activeLink: {
    color: '#181513',
    fontWeight: '700',
    borderBottom: '2px solid #6F3E22',
    paddingBottom: '2px',
  },
  cartLink: {
    color: '#4A2E1B',
    backgroundColor: '#F4EDE4',
    border: '1px solid #DDD0BF',
    padding: '5px 12px',
    borderRadius: '20px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  activeCartLink: {
    color: '#FFFFFF',
    backgroundColor: '#181513',
    border: '1px solid #181513',
    boxShadow: '0 2px 6px rgba(24, 21, 19, 0.25)',
  },
  userText: {
    fontSize: '14px',
    color: '#5C4D43',
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: '#2A2421',
    color: '#FFFFFF',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
};

export default Navbar;
