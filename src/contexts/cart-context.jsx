import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(undefined);

const CART_STORAGE_KEY = 'cart_items';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on mount
  const [items, setItems] = useState(() => loadCartFromStorage());

  // Save cart to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.size === item.size);
      let newItems;
      if (existing) {
        newItems = prev.map((i) => (i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        newItems = [...prev, { ...item, quantity: 1 }];
      }
      return newItems;
    });
  };

  const removeItem = (id, size) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => !(i.id === id && i.size === size));
      return newItems;
    });
  };

  const updateQuantity = (id, size, quantity) => {
    if (quantity <= 0) {
      removeItem(id, size);
      return;
    }
    setItems((prev) => {
      const newItems = prev.map((i) => (i.id === id && i.size === size ? { ...i, quantity } : i));
      return newItems;
    });
  };

  const clearCart = () => {
    setItems([]);
    // Also clear from localStorage
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

