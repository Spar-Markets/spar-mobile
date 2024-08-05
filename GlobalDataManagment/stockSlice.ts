import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StockState {
  stockPrice: number | null;
}

const initialState: StockState = {
  stockPrice: null,
};

const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    updateStockPrice: (state, action: PayloadAction<number | null>) => {
      state.stockPrice = action.payload;
    }
  },
});

export const { updateStockPrice } = stockSlice.actions;
export default stockSlice.reducer;