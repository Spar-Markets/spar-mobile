import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveMatch {
  id: string;
  endAt: Date;
}

interface ActiveMatchesState {
  activeMatches: Record<string, ActiveMatch>;
}

const initialState: ActiveMatchesState = {
  activeMatches: {}
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveMatches: (state, action: PayloadAction<ActiveMatch[]>) => {
      const matches = action.payload.reduce((acc, match) => {
        acc[match.id] = match;
        return acc;
      }, {} as Record<string, ActiveMatch>);
      state.activeMatches = matches;
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      delete state.activeMatches[action.payload];
    },
    addMatch: (state, action: PayloadAction<{ id: string; endAt: string }>) => {
      const { id, endAt } = action.payload;
      if (!state.activeMatches[id]) {
        state.activeMatches[id] = { id, endAt: new Date(endAt) };
        // Convert the object to an array, sort it, and then convert it back to an object
        const sortedMatches = Object.values(state.activeMatches).sort((a, b) => a.endAt.getTime() - b.endAt.getTime());
        state.activeMatches = sortedMatches.reduce((acc, match) => {
          acc[match.id] = match;
          return acc;
        }, {} as Record<string, ActiveMatch>);
      }
    }
  }
});

export const { setActiveMatches, removeMatch, addMatch } = userSlice.actions;
export default userSlice.reducer;
