import { useCallback, useEffect, useState } from 'react';
import WishlistContext from './WishlistContext';
import { getWishlist } from '../services/api';
import { useAuth } from './AuthContext';

export const WishlistProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [wishlistCountState, setWishlistCountState] = useState({ user: null, count: null });
  const wishlistCount = wishlistCountState.user === user ? wishlistCountState.count : null;

  const refreshWishlistCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await getWishlist();
      if (!Number.isInteger(response.data?.count)) {
        throw new Error('Wishlist response did not include a valid count.');
      }
      setWishlistCountState({ user, count: response.data.count });
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
      setWishlistCountState({ user, count: null });
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;

    let active = true;
    const loadWishlistCount = async () => {
      try {
        const response = await getWishlist();
        if (!Number.isInteger(response.data?.count)) {
          throw new Error('Wishlist response did not include a valid count.');
        }
        if (active) {
          setWishlistCountState({ user, count: response.data.count });
        }
      } catch (error) {
        console.error('Error fetching wishlist count:', error);
        if (active) {
          setWishlistCountState({ user, count: null });
        }
      }
    };

    loadWishlistCount();
    return () => {
      active = false;
    };
  }, [authLoading, user]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};
