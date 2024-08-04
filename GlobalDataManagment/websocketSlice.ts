import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// pass in a matchID and get an object
// pass in ticker and get a number

interface WebSocketState {
  [key: string]: Object | number; // {"APPL": 564.54} or {"fjuashfadsfds": {yourformattedData, }}
}

const initialState: WebSocketState = {};

const websocketSlice = createSlice({
  name: 'websockets',
  initialState,
  reducers: {
    /*addWebSocket: (state, action: PayloadAction<{ id: string, ws: WebSocket | null }>) => {
      const { id, ws } = action.payload;
      state[id] = ws;
    },
    removeWebSocket: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },*/
  },
});

export const { /*addWebSocket, removeWebSocket*/ } = websocketSlice.actions;
export default websocketSlice.reducer;