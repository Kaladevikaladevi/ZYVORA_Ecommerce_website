// Format a number as Indian Rupees.
export const formatPrice = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN')}`;

// The price a customer actually pays (discount when present).
export const effectivePrice = (p) =>
  p?.discountPrice && p.discountPrice > 0 ? p.discountPrice : p?.price || 0;

// Percentage off, 0 when no discount.
export const discountPercent = (p) => {
  if (!p?.discountPrice || p.discountPrice <= 0) return 0;
  return Math.round(((p.price - p.discountPrice) / p.price) * 100);
};

// Human-friendly date.
export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// Map an order status to a CSS modifier / colour bucket.
export const statusTone = (status) => {
  const map = {
    Pending: 'pending',
    Confirmed: 'info',
    Processing: 'info',
    Shipping: 'info',
    Delivered: 'success',
    Cancelled: 'danger',
    Paid: 'success',
    Failed: 'danger',
  };
  return map[status] || 'pending';
};

// Cart/order pricing — single source of truth on the client.
export const TAX_RATE = 0.05;
export const FREE_SHIPPING_THRESHOLD = 2000;
export const SHIPPING_FEE = 99;

export const computeTotals = (subtotal) => {
  const tax = Math.round(subtotal * TAX_RATE);
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
};
