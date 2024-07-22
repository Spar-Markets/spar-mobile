import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// keeps track of the live price for the current stock you are looking at

const initialState: number = 0;

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    updateStockPrice: (state, action: PayloadAction<number>) => {
        return action.payload;
    }
  },
});

export const { updateStockPrice } = stockSlice.actions;

export default stockSlice.reducer;