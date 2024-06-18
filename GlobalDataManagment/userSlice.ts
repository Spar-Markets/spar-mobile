import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    isInMatchmaking: boolean
}

const initialState = {
  isInMatchmaking: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsInMatchmaking: (state, action) => {
      state.isInMatchmaking = action.payload;
    },
  },
});

export const { setIsInMatchmaking } = userSlice.actions;
export default userSlice.reducer;
