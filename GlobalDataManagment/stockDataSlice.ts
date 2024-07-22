// src/redux/colorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  yourColor: '#000', // Default color
  oppColor: '#000',  // Default color
  globalTickers: []
};

const stockDataSlice = createSlice({
  name: 'stockData',
  initialState,
  reducers: {
    setGlobalTickers: (state, action) => {
      state.globalTickers = action.payload
    }
  },
});

export const { setGlobalTickers } = stockDataSlice.actions;

export default stockDataSlice.reducer;