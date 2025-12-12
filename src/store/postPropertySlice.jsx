import { createSlice} from '@reduxjs/toolkit'

const initialState = {
  step1: {
    propertyType: null,
  }
}

const postPropertyFormSlice = createSlice({
  name: 'postPropertyForm',
  initialState,
  reducers: {
    
    setStep1Data: (state, action) => {
      state.step1 = {...state.step1, propertyType: action.payload.propertyType }
    }
  },
});

export const { setStep1Data } = postPropertyFormSlice.actions;

export const step1Data = (state) => state.postPropertyForm.step1;

export default postPropertyFormSlice.reducer;

