import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteCookie } from 'cookies-next';

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    
      
      deleteCookie("token");
      deleteCookie("refreshToken");
      deleteCookie("user");
      deleteCookie("role"); 
    
    
      window.location.href = "/login";
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;