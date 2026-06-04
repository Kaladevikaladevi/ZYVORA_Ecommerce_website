import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const res = await api.get('/cart');
  return res.data.cart;
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await api.post('/cart', { productId, quantity });
      toast.success('Added to cart');
      return res.data.cart;
    } catch (e) {
      toast.error(e.message);
      return rejectWithValue(e.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/cart/${productId}`, { quantity });
      return res.data.cart;
    } catch (e) {
      toast.error(e.message);
      return rejectWithValue(e.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    toast.info('Removed from cart');
    return res.data.cart;
  }
);

export const clearCart = createAsyncThunk('cart/clear', async () => {
  const res = await api.delete('/cart');
  return res.data.cart;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false },
  reducers: {
    resetCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    const setItems = (state, action) => {
      state.loading = false;
      state.items = action.payload?.items || [];
    };
    builder
      .addCase(fetchCart.fulfilled, setItems)
      .addCase(addToCart.fulfilled, setItems)
      .addCase(updateCartItem.fulfilled, setItems)
      .addCase(removeFromCart.fulfilled, setItems)
      .addCase(clearCart.fulfilled, (s) => { s.items = []; });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
const unit = (p) => (p?.discountPrice > 0 ? p.discountPrice : p?.price || 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + unit(i.product) * i.quantity, 0);
