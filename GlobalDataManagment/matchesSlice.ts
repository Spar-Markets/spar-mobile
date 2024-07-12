import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MatchObject {
  avgCostBasis: number;
  ticker: string;
  totalShares: number
  // Add other fields as needed
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
    addOrUpdateMatch: (state, action: PayloadAction<{ matchID: string; yourAssets: MatchObject[]; opponentAssets: MatchObject[] }>) => {
      const { matchID, yourAssets, opponentAssets } = action.payload;
      state[matchID] = { yourAssets, opponentAssets };
    },
    updateYourAssets: (state, action: PayloadAction<{ matchID: string; yourAssets: MatchObject[] }>) => {
      const { matchID, yourAssets } = action.payload;
      if (state[matchID]) {
        state[matchID].yourAssets = yourAssets;
      }
    },
    updateOpponentAssets: (state, action: PayloadAction<{ matchID: string; opponentAssets: MatchObject[] }>) => {
      const { matchID, opponentAssets } = action.payload;
      if (state[matchID]) {
        state[matchID].opponentAssets = opponentAssets;
      }
    },
  },
});

export const { addOrUpdateMatch, updateYourAssets, updateOpponentAssets } = matchesSlice.actions;

export default matchesSlice.reducer;