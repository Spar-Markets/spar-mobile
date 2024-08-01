import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    isInMatchmaking: boolean
    isUserMade: boolean
    userID: string | null;
    username: string;
    userBio: string;
    balance:number;
    hasDefaultProfileImage: boolean;
    skillrating: number;
    following: Follower[];
    followers: Follower[]
}

const initialState = {
  isInMatchmaking: false,
  isUserMade: false,
  userID: null,
  username: null,
  userBio: null,
  balance: null,
  hasDefaultProfileImage: true,
  skillRating: null,
  following: [] as Follower[],
  followers: [] as Follower[]

}

interface Follower {
  userID: string;
  username: string;
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
    }
  }
});

export const { setIsInMatchmaking, addFollower, addFollowing, setUserIsMade, setUserID, setUserBio, setUsername, setHasDefaultProfileImage, setBalance, setSkillRating, setFollowers, setFollowing } = userSlice.actions;
export default userSlice.reducer;
