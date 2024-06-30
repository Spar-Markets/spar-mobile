import { configureStore } from '@reduxjs/toolkit';
import postsReducer from './postSlice';
import userReducer from './userSlice';
import imageReducer from './imageSlice';

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    user: userReducer,
    image: imageReducer,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;