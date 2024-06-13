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
    setUpvoteStatus(state, action: PayloadAction<{ postId: string; isUpvoted: boolean }>) {
      const post = state.find((p) => p.postId === action.payload.postId);
      if (post) {
        post.isUpvoted = action.payload.isUpvoted;
      }
    },
    setDownvoteStatus(state, action: PayloadAction<{ postId: string; isDownvoted: boolean }>) {
      const post = state.find((p) => p.postId === action.payload.postId);
      if (post) {
        post.isDownvoted = action.payload.isDownvoted;
      }
    },
    addPost(state, action: PayloadAction<PostType>) {
      state.unshift(action.payload);
    },
    setPosts(state, action: PayloadAction<PostType[]>) {
      return action.payload;
    }
  },
  /* DB implementation
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<PostType[]>) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      });
  },*/
});

export const { upvotePost, downvotePost, setDownvoteStatus, setUpvoteStatus, addPost, setPosts } = postsSlice.actions;
export default postsSlice.reducer;
