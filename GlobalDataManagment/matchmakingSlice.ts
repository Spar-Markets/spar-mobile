import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface matchmakingData {
    challengedFriend: {username: string, userID: string}
}

const initialState = {
  challengedFriend: {username: null, userID: null}
}

const matchmakingSlice = createSlice({
  name: 'matchmaking',
  initialState,
  reducers: {
    setChallengedFriend: (state, action) => {
      state.challengedFriend = action.payload;
    },

  }
});

export const { setChallengedFriend } = matchmakingSlice.actions;
export default matchmakingSlice.reducer;
