import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profileImageUri: null,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setProfileImageUri: (state, action) => {
      state.profileImageUri = action.payload;
    },
  },
});

export const { setProfileImageUri } = imageSlice.actions;

export default imageSlice.reducer;