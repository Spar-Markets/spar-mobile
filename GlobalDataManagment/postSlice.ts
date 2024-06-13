import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import timeAgo from '../utility/timeAgo';
import PostType from '../types/PostType';

type PostsState = PostType[];

const initialState: PostsState = [];

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    upvotePost(state, action: PayloadAction<string>) {
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
    downvotePost(state, action: PayloadAction<string>) {
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
    updatePostVotes(state, action: PayloadAction<PostType>) {
      const index = state.findIndex(post => post.postId === action.payload.postId);
      if (index !== -1) {
        state[index] = {
          ...state[index],
          votes: action.payload.votes,
          postedTime: action.payload.postedTime,
          postedTimeAgo: timeAgo(new Date(action.payload.postedTime))
        };
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
    addPost(state, action: PayloadAction<PostType>) {
      const newPost = { ...action.payload, postedTimeAgo: timeAgo(new Date(action.payload.postedTime)) };
      state.unshift(newPost);
    },
    setPosts(state, action: PayloadAction<PostType[]>) {
      const newPosts = action.payload.reverse(); // Reverse the order of fetched posts
      newPosts.forEach(newPost => {
        const existingPostIndex = state.findIndex(post => post.postId === newPost.postId);
        if (existingPostIndex !== -1) {
          // Update the existing post
          state[existingPostIndex] = {
            ...state[existingPostIndex],
            ...newPost,
            postedTimeAgo: timeAgo(new Date(newPost.postedTime))
          };
        } else {
          // Add new post
          state.unshift({
            ...newPost,
            postedTimeAgo: timeAgo(new Date(newPost.postedTime))
          });
        }
      });
    },
  },
});

export const { upvotePost, downvotePost, updatePostVotes, setDownvoteStatus, setUpvoteStatus, addPost, setPosts } = postsSlice.actions;
export default postsSlice.reducer;
