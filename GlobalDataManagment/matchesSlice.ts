import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MatchObject {
  avgCostBasis: number;
  ticker: string;
  totalShares: number;
}

interface TickerPrices {
  [ticker: string]: number;
}

interface MatchData {
  yourAssets: MatchObject[];
  opponentAssets: MatchObject[];
  yourBuyingPower: number;
  oppBuyingPower: number;
  yourTickerPrices: TickerPrices;
  oppTickerPrices: TickerPrices;
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
        state[matchID] = {
          yourAssets: [],
          opponentAssets: [],
          yourBuyingPower: 100000,
          oppBuyingPower: 100000,
          yourTickerPrices: {},
          oppTickerPrices: {}
        };
      }
    },
    addOrUpdateMatch: (state, action: PayloadAction<{ matchID: string; yourAssets: MatchObject[]; opponentAssets: MatchObject[]; yourBuyingPower: number; oppBuyingPower: number; yourTickerPrices?: TickerPrices; oppTickerPrices?: TickerPrices; }>) => {
      const { matchID, yourAssets, opponentAssets, yourBuyingPower, oppBuyingPower, yourTickerPrices, oppTickerPrices } = action.payload;
      if (state[matchID]) {
        state[matchID].yourAssets = yourAssets;
        state[matchID].opponentAssets = opponentAssets;
        state[matchID].yourBuyingPower = yourBuyingPower;
        state[matchID].oppBuyingPower = oppBuyingPower;
      }
    },
    updateYourTickerPrices: (state, action: PayloadAction<{ matchID: string; yourTickerPrices: TickerPrices }>) => {
      const { matchID, yourTickerPrices } = action.payload;
      if (state[matchID]) {
        state[matchID].yourTickerPrices = { ...state[matchID].yourTickerPrices, ...yourTickerPrices };
      }
    },
    updateOppTickerPrices: (state, action: PayloadAction<{ matchID: string; oppTickerPrices: TickerPrices }>) => {
      const { matchID, oppTickerPrices } = action.payload;
      if (state[matchID]) {
        state[matchID].oppTickerPrices = { ...state[matchID].oppTickerPrices, ...oppTickerPrices };
      }
    },
    deleteMatch: (state, action: PayloadAction<{ matchID: string }>) => {
      const { matchID } = action.payload;
      if (state[matchID]) {
        delete state[matchID];
      }
    },
  },
});

export const { initializeMatch, addOrUpdateMatch, updateYourTickerPrices, updateOppTickerPrices, deleteMatch } = matchesSlice.actions;

export default matchesSlice.reducer;
