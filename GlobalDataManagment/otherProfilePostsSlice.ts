import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import timeAgo from '../utility/timeAgo';
import PostType from '../types/PostType';
import CommentType from '../types/CommentType';

type PostsState = PostType[];

const initialState: PostsState = [];

const otherProfilePostsSlice = createSlice({
  name: 'yourPosts',
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
      //newPost.numComments = newPost.comments.length
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
            postedTimeAgo: timeAgo(new Date(newPost.postedTime)),
          };
        } else {
          // Add new post
          state.unshift({
            ...newPost,
            postedTimeAgo: timeAgo(new Date(newPost.postedTime)),
          });
        }
      });
    },
    appendPosts(state, action: PayloadAction<PostType[]>) {
      const newPosts = action.payload.map(newPost => ({
        ...newPost,
        postedTimeAgo: timeAgo(new Date(newPost.postedTime)),
      }));
      state.push(...newPosts); // Append new posts to the end of the array
    },
    addCommentToPost(state, action: PayloadAction<{ postId: string; comment: CommentType }>) {
      const { postId, comment } = action.payload;
      const post = state.find((p) => p.postId === postId);
      if (post) {
        if (post.comments) {
          post.comments.push(comment);
        }
        post.numComments += 1;
      }
    },
    setCommentsForPost(state, action: PayloadAction<{ postId: string; comments: CommentType[] }>) {
      const { postId, comments } = action.payload;
      const post = state.find((p) => p.postId === postId);
      if (post) {
        console.log("Comments", comments)
        post.comments = comments; // Directly set comments to avoid duplication issues
        post.numComments = post.comments.length;
      }
    },
    clearCommentsForPost(state, action: PayloadAction<string>) {
      const post = state.find((p) => p.postId === action.payload);
      if (post) {
        post.comments = [];
      }
    },
    deletePost(state, action: PayloadAction<string>) {
      const index = state.findIndex((post) => post.postId === action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      }
    },
    addCommentsToPost(state, action: PayloadAction<{ postId: string; comments: CommentType[] }>) {
      const { postId, comments } = action.payload;
      const post = state.find((p) => p.postId === postId);
      if (post) {
        if (post.comments) {
          post.comments.push(...comments); // Append the new comments to the existing ones
        } else {
          post.comments = comments; // If no comments exist, initialize with the new comments
        }
        post.numComments += comments.length; // Update the comment count
      }
    },
    clearPosts(state) {
        return []; // Resets the state to an empty array
    },
  },
});

export const { upvotePost, clearPosts, addCommentsToPost, clearCommentsForPost, appendPosts, deletePost, setCommentsForPost, downvotePost, updatePostVotes, setDownvoteStatus, setUpvoteStatus, addPost, setPosts, addCommentToPost } = otherProfilePostsSlice.actions;
export default otherProfilePostsSlice.reducer;
