import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postSlice';
import userReducer from './userSlice';
import imageReducer from './imageSlice';
import websocketReducer from './websocketSlice';
import matchesReducer from './matchesSlice'
import stockDataSlice from './stockDataSlice';
import stockSlice from './stockSlice';
import uiSlice from './uiSlice';
import activeMatchesSlice from './activeMatchesSlice';
import matchmakingSlice from './matchmakingSlice';
import marketStatusSlice from './marketStatusSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    user: userReducer,
    image: imageReducer,
    websockets: websocketReducer,
    matches: matchesReducer,
    stockData: stockDataSlice,
    stock: stockSlice,
    ui: uiSlice,
    activeMatches: activeMatchesSlice,
    matchmaking: matchmakingSlice,
    marketStatus: marketStatusSlice
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;