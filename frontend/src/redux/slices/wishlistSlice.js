import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-toastify';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async () => {
  const res = await api.get('/wishlist');
  return res.data.wishlist;
});

export const addToWishlist = createAsyncThunk(
  'wishlist/add',
  async (productId) => {
    const res = await api.post('/wishlist', { productId });
    toast.success('Added to wishlist');
    return res.data.wishlist;
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/remove',
  async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    toast.info('Removed from wishlist');
    return res.data.wishlist;
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [] },
  reducers: {
    resetWishlist(state) {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    const set = (s, a) => { s.products = a.payload?.products || []; };
    builder
      .addCase(fetchWishlist.fulfilled, set)
      .addCase(addToWishlist.fulfilled, set)
      .addCase(removeFromWishlist.fulfilled, set);
  },
});

export const { resetWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.products.some((p) => (p._id || p) === productId);
