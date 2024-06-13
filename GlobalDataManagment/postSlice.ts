import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios'
import { serverUrl } from '../constants/global';

type PostType = {
  postId: string; // Ensure postId is a string
  username: string;
  postedTime: any;
  type: string;
  title: string;
  body: string;
  numComments: number;
  numReposts: number;
  votes: number;
  hasImage: boolean;
  isUpvoted: boolean;
  isDownvoted: boolean;
};

type PostsState = PostType[];

const initialState: PostsState = [];


const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    upvotePost(state, action: PayloadAction<string>) { // Ensure postId is string
      const post = state.find((p) => p.postId === action.payload);
      if (post) {
        if (!post.isUpvoted && !post.isDownvoted) {
          post.votes += 1;
          post.isUpvoted = true;
          
        } else if (post.isUpvoted) {
          post.votes -= 1;
          post.isUpvoted = false;
        } else if (post.isDownvoted) {
          post.votes += 2;
          post.isUpvoted = true;
          post.isDownvoted = false;
        }
      }
    },
    downvotePost(state, action: PayloadAction<string>) { // Ensure postId is string
      const post = state.find((p) => p.postId === action.payload);
      if (post) {
        if (!post.isDownvoted && !post.isUpvoted) {
          post.votes -= 1;
          post.isDownvoted = true;
        } else if (post.isDownvoted) {
          post.votes += 1;
          post.isDownvoted = false;
        } else if (post.isUpvoted) {
          post.votes -= 2;
          post.isDownvoted = true;
          post.isUpvoted = false;
        }
      }
    },
    updatePostVotes: (state, action: PayloadAction<PostType>) => {
      const index = state.findIndex(post => post.postId === action.payload.postId);
      if (index !== -1) {
        state[index].votes = action.payload.votes;
      }
    },
    setUpvoteStatus(state, action) {
      const post = state.find((p) => p.postId === action.payload.postId);
      if (post) {
        post.isUpvoted = action.payload.isUpvoted;
      }
    },
    setDownvoteStatus(state, action) {
      const post = state.find((p) => p.postId === action.payload.postId);
      if (post) {
        post.isDownvoted = action.payload.isDownvoted;
      }
    },
    addPost(state, action) {
      state.unshift(action.payload);
    },
    setPosts(state, action) {
      return action.payload;
    },
    
    
  },
});

export const { upvotePost, downvotePost, updatePostVotes, setDownvoteStatus, setUpvoteStatus, addPost, setPosts } = postsSlice.actions;
export default postsSlice.reducer;

