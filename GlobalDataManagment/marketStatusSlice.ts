import { createSlice } from '@reduxjs/toolkit';
import isMarketOpen from '../utility/marketOpen';

const initialState = {
  isMarketOpen: isMarketOpen(),
};

const marketStatusSlice = createSlice({
  name: 'marketStatus', 
  initialState,
  reducers: {
    setIsMarketOpen: (state, action) => {
      state.isMarketOpen = action.payload;
    },
  },
});

export const { setIsMarketOpen } = marketStatusSlice.actions;

export default marketStatusSlice.reducer;