import { POST_PROPERTY_STEPS } from '../lib/enums';
import { createSlice} from '@reduxjs/toolkit';

const initialState = {
  step_1_Progress: null,
  step_2_Progress: null,
  step_3_Progress: null,
  step_4_Progress: null,
  totalProgress: 0,
  stepList: POST_PROPERTY_STEPS,
  activeStep: 1
};

const postPropertyProgressSlice = createSlice({
  name: 'postPropertyProgress',
  initialState,
  reducers: {
    updateStepProgress: (
      state,
      action
    ) => {
      const { step, progress } = action.payload;
      
      switch (step) {
        case 1:
          state.step_1_Progress = progress;
          break;
        case 2:
          state.step_2_Progress = progress;
          break;
        case 3:
          state.step_3_Progress = progress;
          break;
        case 4:
          state.step_4_Progress = progress;
          break;
        default:
          console.warn(`Invalid step: ${step}`);
      }

      // Recalculate total each time a step is updated
      const allSteps = [
        state.step_1_Progress,
        state.step_2_Progress,
        state.step_3_Progress,
        state.step_4_Progress,
      ].filter((v) => v !== null);

      state.totalProgress =
        allSteps.length > 0
          ? Math.round(allSteps.reduce((a, b) => a + b, 0))
          : 0;
    },

    
    calculateTotalProgress: (state) => {
      const allSteps = [
        state.step_1_Progress,
        state.step_2_Progress,
        state.step_3_Progress,
        state.step_4_Progress,
      ].filter((v) => v !== null);

      state.totalProgress =
        allSteps.length > 0
          ? Math.round(allSteps.reduce((a, b) => a + b, 0) / allSteps.length)
          : 0;
    },

    // Reset all progress values
    resetProgress: (state) => {
      state.step_1_Progress = null;
      state.step_2_Progress = null;
      state.step_3_Progress = null;
      state.step_4_Progress = null;
      state.totalProgress = 0;
    },

    setActiveStep: (
      state,
      action
    ) => {
      const { step } = action.payload;
      state.activeStep = step
    },

    setTotalProgress: ( state,
      action) => {
        state.totalProgress = action.payload.progress
    },
  },
});

export const {
  updateStepProgress,
  calculateTotalProgress,
  resetProgress,
  setActiveStep,
  setTotalProgress,
} = postPropertyProgressSlice.actions;

export default postPropertyProgressSlice.reducer;

// Selectors
export const selectStepProgress = (state, step) => {
  switch (step) {
    case 1:
      return state.step_1_Progress;
    case 2:
      return state.step_2_Progress;
    case 3:
      return state.step_3_Progress;
    case 4:
      return state.step_4_Progress;
    default:
      return null;
  }
};

export const selectTotalProgress = (state) => state.totalProgress;
export const getStepList = (state) => state.postPropertyProgress.stepList;
export const getActiveStep = (state) => state.postPropertyProgress.activeStep;
