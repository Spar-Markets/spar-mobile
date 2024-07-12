import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postSlice';
import userReducer from './userSlice';
import imageReducer from './imageSlice';
import websocketReducer from './websocketSlice';
import matchesReducer from './matchesSlice'

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    user: userReducer,
    image: imageReducer,
    websockets: websocketReducer,
    matches: matchesReducer,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;