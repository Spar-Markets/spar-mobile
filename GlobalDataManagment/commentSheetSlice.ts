
  import { createSlice, PayloadAction } from '@reduxjs/toolkit';
  
  interface CommentSheetState {
    selectedPost: string | null
    selectedPostImageData: any | null
  
  }
  
  const initialState: CommentSheetState = {
    selectedPost: null,
    selectedPostImageData: null
  }
  
  
  const commentSheetSlice = createSlice({
    name: 'commentSheet',
    initialState,
    reducers: {
        setSelectedPost: (state, action) => {
            state.selectedPost = action.payload;
        },
        setSelectedPostImageData: (state, action) => {
            state.selectedPostImageData = action.payload
        }
    }
  });
  
  
  export const { setSelectedPost, setSelectedPostImageData } = commentSheetSlice.actions;
  
  export default commentSheetSlice.reducer;
  