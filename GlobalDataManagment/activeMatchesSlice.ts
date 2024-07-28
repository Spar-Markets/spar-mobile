import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface activeMatchesState {
  activeMatches: string[]
}

const initialState: activeMatchesState = {
  activeMatches: []
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveMatches: (state, action: PayloadAction<string[]>) => {
      state.activeMatches = action.payload;
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      state.activeMatches = state.activeMatches.filter(match => match !== action.payload);
    },
    addMatch: (state, action: PayloadAction<string>) => {
        if (!state.activeMatches.includes(action.payload)) {
            state.activeMatches.push(action.payload);
        }
    },
  }
});

export const { setActiveMatches, removeMatch, addMatch } = userSlice.actions;
export default userSlice.reducer;
