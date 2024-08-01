import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface activeMatchesState {
  activeMatches: Record<string, Date>;
}

const initialState: activeMatchesState = {
  activeMatches: {}
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveMatches: (state, action: PayloadAction<Record<string, Date>>) => {
      console.log("SETACTIVEMATCHES payload:", action.payload);
      state.activeMatches = action.payload;
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      delete state.activeMatches[action.payload];
    },
    addMatch: (state, action: PayloadAction<{ id: string; endAt: string }>) => {
      const { id, endAt } = action.payload;
      if (!state.activeMatches[id]) {
        console.log("addMatch - before:", state.activeMatches);
        console.log("addMatch payload:", action.payload);

        // Convert activeMatches to an array of entries
        const entries = Object.entries(state.activeMatches).map(([id, endAt]) => ({ id, endAt }));

        // Create a new match entry
        const newMatch = { id, endAt: new Date(endAt) };

        // Find the correct position to insert the new match
        const index = entries.findIndex(entry => new Date(entry.endAt) > newMatch.endAt);
        if (index === -1) {
          entries.push(newMatch);
        } else {
          entries.splice(index, 0, newMatch);
        }

        // Convert the array back to an object
        state.activeMatches = entries.reduce((acc, { id, endAt }) => {
          acc[id] = endAt;
          return acc;
        }, {} as Record<string, Date>);

        console.log("addMatch - after:", state.activeMatches);
      }
    },
  },
});

export const { setActiveMatches, removeMatch, addMatch } = userSlice.actions;
export default userSlice.reducer;
