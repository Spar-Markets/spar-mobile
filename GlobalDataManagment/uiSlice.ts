import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    startMatch: boolean
}

const initialState = {
    startMatch: false
  
}

const uiSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setStartMatch: (state, action) => {
      state.startMatch = action.payload;
    },
  }
});

export const { setStartMatch} = uiSlice.actions;
export default uiSlice.reducer;
