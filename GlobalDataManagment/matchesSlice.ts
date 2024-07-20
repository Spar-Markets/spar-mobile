import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MatchObject {
  avgCostBasis: number;
  ticker: string;
  totalShares: number;
}

interface MatchData {
  yourAssets: MatchObject[];
  opponentAssets: MatchObject[];
  yourBuyingPower: number; 
  oppBuyingPower: number;
}

interface MatchesState {
  [key: string]: MatchData;
}

const initialState: MatchesState = {};

const matchesSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    initializeMatch: (state, action: PayloadAction<{ matchID: string }>) => {
      const { matchID } = action.payload;
      if (!state[matchID]) {
        state[matchID] = { yourAssets: [], opponentAssets: [], yourBuyingPower: 100000, oppBuyingPower: 100000 };
      }
    },
    addOrUpdateMatch: (state, action: PayloadAction<{ matchID: string; yourAssets: MatchObject[]; opponentAssets: MatchObject[]; yourBuyingPower:number; oppBuyingPower:number }>) => {
      const { matchID, yourAssets, opponentAssets, yourBuyingPower, oppBuyingPower } = action.payload;
      state[matchID] = { yourAssets, opponentAssets, yourBuyingPower, oppBuyingPower };
    },
  },
});

export const { initializeMatch, addOrUpdateMatch } = matchesSlice.actions;

export default matchesSlice.reducer;
