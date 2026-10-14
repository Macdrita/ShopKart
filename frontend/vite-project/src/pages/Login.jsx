import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginCustomer } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { fetchUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email || !formData.password) {
      setErrorMessage('Invalid Credentials');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginCustomer(formData);
      if (response.data?.token) {
        localStorage.setItem('shopkart_token', response.data.token);
      }
      if (fetchUser) {
        await fetchUser();
      }
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('Invalid Credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {errorMessage && <div style={styles.alertError}>{errorMessage}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6DED4',
    borderRadius: '16px',
    padding: '32px 28px',
    boxShadow: '0 4px 20px rgba(45, 30, 20, 0.06)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#181513',
    letterSpacing: '-0.3px',
  },
  alertError: {
    backgroundColor: '#FBF0EF',
    color: '#992222',
    border: '1px solid #F3D2CF',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#382921',
  },
  input: {
    padding: '12px 14px',
    fontSize: '14px',
    border: '1px solid #DDD0BF',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#FCFAF7',
    color: '#181513',
    transition: 'border-color 0.2s',
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#181513',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '14px',
    textAlign: 'center',
    color: '#6E6259',
  },
  link: {
    color: '#6F3E22',
    textDecoration: 'none',
    fontWeight: '700',
  },
};

export default Login;
