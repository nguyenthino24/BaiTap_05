// Utility functions for managing recently viewed products in localStorage

const RECENTLY_VIEWED_KEY = 'recentlyViewedProducts';

// Get user ID from localStorage
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.id : 'guest';
};

// Get recently viewed products for current user
export const getRecentlyViewed = () => {
  try {
    const userId = getUserId();
    const key = `${RECENTLY_VIEWED_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting recently viewed products:', error);
    return [];
  }
};

// Add a product to recently viewed list
export const addToRecentlyViewed = (product) => {
  try {
    const userId = getUserId();
    const key = `${RECENTLY_VIEWED_KEY}_${userId}`;
    let viewed = getRecentlyViewed();

    // Remove if already exists
    viewed = viewed.filter(p => p.id !== product.id);

    // Add to beginning
    viewed.unshift({
      ...product,
      viewedAt: new Date().toISOString()
    });

    // Keep only 10 most recent
    if (viewed.length > 10) {
      viewed = viewed.slice(0, 10);
    }

    localStorage.setItem(key, JSON.stringify(viewed));
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
  }
};

// Clear recently viewed for current user
export const clearRecentlyViewed = () => {
  try {
    const userId = getUserId();
    const key = `${RECENTLY_VIEWED_KEY}_${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing recently viewed:', error);
  }
};
