import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActiveMatch {
  matchID: string;
  endAt: Date;
}

interface activeMatchesState {
  activeMatches: ActiveMatch[];
}

const initialState: activeMatchesState = {
  activeMatches: []
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setActiveMatches: (state, action: PayloadAction<ActiveMatch[]>) => {
      
      console.log("SETACTIVEMATCHES payload:", action.payload);
      state.activeMatches = action.payload;
    },
    removeMatch: (state, action: PayloadAction<string>) => {
      state.activeMatches = state.activeMatches.filter(match => match.matchID !== action.payload);
    },
    addMatch: (state, action: PayloadAction<{ matchID: string; endAt: string }>) => {
      const { matchID, endAt } = action.payload;
      console.log("granty", action.payload)
      console.log("heres the state", state.activeMatches)
      if (!state.activeMatches.find(match => match.matchID === matchID)) {
        console.log("addMatch - before:", state.activeMatches);
        console.log("addMatch payload:", action.payload);

        // Create a new match entry
        const newMatch = { matchID, endAt: new Date(endAt) };

        // Find the correct position to insert the new match based on endAt
        const index = state.activeMatches.findIndex(entry => new Date(entry.endAt) > newMatch.endAt);
        if (index === -1) {
          state.activeMatches.push(newMatch);
        } else {
          state.activeMatches.splice(index, 0, newMatch);
        }

        console.log("addMatch - after:", state.activeMatches);
      }
    },
  },
});

export const { setActiveMatches, removeMatch, addMatch } = userSlice.actions;
export default userSlice.reducer;
