
  import { createSlice, PayloadAction } from '@reduxjs/toolkit';
  
  interface CommentSheetState {
    selectedPost: string | null
  
  }
  
  const initialState: CommentSheetState = {
    selectedPost: null
  }
  
  
  const commentSheetSlice = createSlice({
    name: 'commentSheet',
    initialState,
    reducers: {
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        }
    }
  });
  
  
  export const { setSelectedPost } = commentSheetSlice.actions;
  
  export default commentSheetSlice.reducer;
  