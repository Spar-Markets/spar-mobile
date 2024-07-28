import { createSlice } from '@reduxjs/toolkit';

interface UserState {
    isInMatchmaking: boolean
    isUserMade: boolean
    userID: string | null;
    username: string;
    userBio: string;
    balance:number
    hasDefaultProfileImage: boolean
}

const initialState = {
  isInMatchmaking: false,
  isUserMade: false,
  userID: null,
  username: null,
  userBio: null,
  balance: null,
  hasDefaultProfileImage: true,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsInMatchmaking: (state, action) => {
      state.isInMatchmaking = action.payload;
    },
    setUserIsMade: (state, action) => {
      state.isUserMade = action.payload;
    },
    setUserID: (state, action) => {
      state.userID = action.payload; // Create a reducer to update userID
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setUserBio: (state, action) => {
      state.userBio = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setHasDefaultProfileImage: (state, action) => {
      state.hasDefaultProfileImage = action.payload
    }
  }
});

export const { setIsInMatchmaking, setUserIsMade, setUserID, setUserBio, setUsername, setHasDefaultProfileImage, setBalance } = userSlice.actions;
export default userSlice.reducer;
