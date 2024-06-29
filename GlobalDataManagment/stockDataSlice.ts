// src/redux/colorSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  yourColor: '#000', // Default color
  oppColor: '#000',  // Default color
};

const stockDataSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    setYourColor: (state, action) => {
      state.yourColor = action.payload;
    },
    setOppColor: (state, action) => {
      state.oppColor = action.payload;
    },
  },
});

export const { setYourColor, setOppColor } = stockDataSlice.actions;

export default stockDataSlice.reducer;