import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    user: any | null;
    userData: any | null;
    loading: boolean;
    error: string | null;
}

const initialState = {
  user: null,
  userData: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, setUserData, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
