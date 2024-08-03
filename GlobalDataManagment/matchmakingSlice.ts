import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface matchmakingData {
    challengedFriend: {username: string, userID: string, profileImageUri: any, hasDefaultProfileImage: boolean}
    imageMap: String[]
}

const initialState = {
  challengedFriend: {username: null, userID: null, profileImageUri: null, hasDefaultProfileImage: null},
  imageMap: [
    '',
    require('../assets/images/profile1.png'),
    require('../assets/images/profile2.png'),
    require('../assets/images/profile3.png'),
  ]
}

const matchmakingSlice = createSlice({
  name: 'matchmaking',
  initialState,
  reducers: {
    setChallengedFriend: (state, action) => {
      state.challengedFriend = action.payload;
      console.log(action.payload)
    },
    resetChallengedFriend: (state) => {
      state.challengedFriend = {
        username: null,
        userID: null,
        profileImageUri: null,
        hasDefaultProfileImage: null
      };
    }
  }
});

export const { setChallengedFriend, resetChallengedFriend } = matchmakingSlice.actions;
export default matchmakingSlice.reducer;
