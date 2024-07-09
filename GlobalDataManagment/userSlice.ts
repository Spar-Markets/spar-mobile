import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    isInMatchmaking: boolean
    isUserMade: boolean
}

const initialState = {
  isInMatchmaking: false,
  isUserMade: false
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsInMatchmaking: (state, action) => {
      state.isInMatchmaking = action.payload;
    },
    setUserIsMade: (state, action) => {
      state.isUserMade = action.payload;
    }
  },
});

export const { setIsInMatchmaking, setUserIsMade } = userSlice.actions;
export default userSlice.reducer;
