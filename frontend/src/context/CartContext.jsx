import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [promotionCode, setPromotionCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // không vượt tồn kho
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === productId) {
          // Không vượt tồn kho
          const newQty = Math.min(quantity, i.stock);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setCustomer(null);
    setPromotionCode('');
    setDiscount(0);
  };

  const subtotal = items.reduce((sum, i) => sum + i.selling_price * i.quantity, 0);
  const total = subtotal - discount;

  return (
    <CartContext.Provider
      value={{
        items, customer, promotionCode, discount, subtotal, total,
        setCustomer, setPromotionCode, setDiscount,
        addItem, updateQuantity, removeItem, clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
