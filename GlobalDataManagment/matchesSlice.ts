import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MatchObject {
  avgCostBasis: number;
  ticker: string;
  totalShares: number;
}

interface MatchAssets {
  yourAssets: MatchObject[];
  opponentAssets: MatchObject[];
}

interface MatchesState {
  [key: string]: MatchAssets;
}

const initialState: MatchesState = {};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    initializeMatch: (state, action: PayloadAction<{ matchID: string }>) => {
      const { matchID } = action.payload;
      if (!state[matchID]) {
        state[matchID] = { yourAssets: [], opponentAssets: [] };
      }
    },
    addOrUpdateMatch: (state, action: PayloadAction<{ matchID: string; yourAssets: MatchObject[]; opponentAssets: MatchObject[] }>) => {
      const { matchID, yourAssets, opponentAssets } = action.payload;
      state[matchID] = { yourAssets, opponentAssets };
    },
  },
});

export const { initializeMatch, addOrUpdateMatch } = matchesSlice.actions;

export default matchesSlice.reducer;
