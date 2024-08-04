import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isInMatchmaking: boolean;
  isUserMade: boolean;
  userID: string | null;
  username: string | null;
  userBio: string | null;
  balance: number | null;
  hasDefaultProfileImage: boolean | null;
  defaultProfileImage: string | null;
  skillRating: number | null;
  friends: string[];
  invitations: Record<string, any> | null;
}

const initialState: UserState = {
  isInMatchmaking: false,
  isUserMade: false,
  userID: null,
  username: null,
  userBio: null,
  balance: null,
  hasDefaultProfileImage: null,
  defaultProfileImage: null,
  skillRating: null,
  friends: [],
  invitations: null
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
    },
    setDefaultProfileImage: (state, action) => {
      state.defaultProfileImage = action.payload
    },
    setSkillRating: (state, action) => {
      state.hasDefaultProfileImage = action.payload
    },
    setFriends: (state, action) => {
      state.friends = action.payload
    },
    addFriend: (state, action: PayloadAction<string>) => {
      state.friends.push(action.payload)
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(friend => friend !== action.payload);
    },
    setInvitations: (state, action) => {
      state.invitations= action.payload
    },
  }
});

export const { setIsInMatchmaking, addFriend, removeFriend, setFriends, setInvitations, setDefaultProfileImage, setUserIsMade, setUserID, setUserBio, setUsername, setHasDefaultProfileImage, setBalance, setSkillRating, } = userSlice.actions;
export default userSlice.reducer;
