import { createSlice } from '@reduxjs/toolkit';
import isMarketOpen from '../utility/marketOpen';

const initialState = {
  isMarketOpen: isMarketOpen(),
};

const marketSlice = createSlice({
  name: 'isMarketOpen', 
  initialState,
  reducers: {
    setProfileImageUri: (state, action) => {
      state.isMarketOpen = action.payload;
    },
  },
});

export const { setProfileImageUri } = isMarketOpenSliceactions;

export default iisMarketOpenSlicereducer;