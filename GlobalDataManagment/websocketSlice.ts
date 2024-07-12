import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebSocketState {
  [key: string]: WebSocket | null;
}

const initialState: WebSocketState = {};

const websocketSlice = createSlice({
  name: 'websockets',
  initialState,
  reducers: {
    addWebSocket: (state, action: PayloadAction<{ id: string, ws: WebSocket | null }>) => {
      const { id, ws } = action.payload;
      state[id] = ws;
    },
    removeWebSocket: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { addWebSocket, removeWebSocket } = websocketSlice.actions;
export default websocketSlice.reducer;