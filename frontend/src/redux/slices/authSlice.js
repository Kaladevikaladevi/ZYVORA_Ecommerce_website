import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const stored = (() => {
  try {
    return JSON.parse(localStorage.getItem('zyvora_user')) || null;
  } catch {
    return null;
  }
})();

export const register = createAsyncThunk(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', data);
      return res.data.user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', data);
      return res.data.user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/auth/me');
      return res.data.user;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored,
    loading: false,
    initializing: true, // true until first loadUser resolves
    error: null,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('zyvora_user', JSON.stringify(action.payload));
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const onAuth = (state, action) => {
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem('zyvora_user', JSON.stringify(action.payload));
    };
    builder
      .addCase(register.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(register.fulfilled, onAuth)
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(login.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(login.fulfilled, onAuth)
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(loadUser.pending, (s) => { s.initializing = true; })
      .addCase(loadUser.fulfilled, (s, a) => {
        s.initializing = false;
        s.user = a.payload;
        localStorage.setItem('zyvora_user', JSON.stringify(a.payload));
      })
      .addCase(loadUser.rejected, (s) => {
        s.initializing = false;
        s.user = null;
        localStorage.removeItem('zyvora_user');
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        localStorage.removeItem('zyvora_user');
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
