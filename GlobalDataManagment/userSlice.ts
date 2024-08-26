import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Invitation {
  challengerUserID: string;
  wager: number;
  timeframe: number;
  createdAt: Date;
  mode: string;
  type: string;
}

interface Follower {
  userID: string;
  username: string;
}

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
  friendCount: number | null;
  createdAt: Date | null

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
  invitations: null,
  friendCount: null,
  createdAt: null
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
    setCreatedAt: (state, action) => {
      state.createdAt = action.payload
    },
    setFriendCount: (state, action) => {
      state.friendCount = action.payload
    },
    addFriend: (state, action: PayloadAction<string>) => {
      state.friends.push(action.payload)
    },
    removeFriend: (state, action: PayloadAction<string>) => {
      state.friends = state.friends.filter(friend => friend !== action.payload);
    },
    setInvitations: (state, action: PayloadAction<{ [key: string]: Invitation }>) => {
      state.invitations = action.payload;
    },
    addInvitation: (state, action: PayloadAction<{ invitationID: string; invitation: Invitation }>) => {
      if (state.invitations) {
        state.invitations[action.payload.invitationID] = action.payload.invitation;
      }
    },
    removeInvitation: (state, action: PayloadAction<string>) => {
      if (state.invitations) {
        delete state.invitations[action.payload];
      }
    }
  }
});


export const { setIsInMatchmaking, removeInvitation, setFriendCount, addFriend, setCreatedAt, removeFriend, setFriends, setInvitations, setDefaultProfileImage, setUserIsMade, setUserID, setUserBio, setUsername, setHasDefaultProfileImage, setBalance, setSkillRating, } = userSlice.actions;

export default userSlice.reducer;
