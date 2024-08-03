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
  following: Follower[];
  followers: Follower[];
  invitations: { [invitationID: string]: Invitation };
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
  following: [],
  followers: [],
  invitations: {}
};

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
    setFollowers: (state, action) => {
      state.followers = action.payload
    },
    setFollowing: (state, action) => {
      state.following = action.payload
    },
    addFollower: (state, action: PayloadAction<Follower>) => {
      state.followers.push(action.payload);
    },
    addFollowing: (state, action: PayloadAction<Follower>) => {
      state.following.push(action.payload);
    },
    setInvitations: (state, action: PayloadAction<{ [key: string]: Invitation }>) => {
      state.invitations = action.payload;
    },
    addInvitation: (state, action: PayloadAction<{ invitationID: string; invitation: Invitation }>) => {
      state.invitations[action.payload.invitationID] = action.payload.invitation;
    },
    removeInvitation: (state, action: PayloadAction<string>) => {
      delete state.invitations[action.payload];
    }
  }
});

export const { setIsInMatchmaking, addInvitation, removeInvitation, setInvitations, setDefaultProfileImage, addFollower, addFollowing, setUserIsMade, setUserID, setUserBio, setUsername, setHasDefaultProfileImage, setBalance, setSkillRating, setFollowers, setFollowing } = userSlice.actions;
export default userSlice.reducer;
