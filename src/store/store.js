import { configureStore } from '@reduxjs/toolkit';
import postPropertyProgressSlice from './postPropertyProgress';
import postPropertyFormSlice from './postPropertySlice';

export const store = configureStore({
  reducer: {
    postPropertyProgress: postPropertyProgressSlice,
    postPropertyForm: postPropertyFormSlice
  },
});
