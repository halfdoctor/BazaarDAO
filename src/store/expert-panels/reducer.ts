import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExpertPanelsState {
  panels: string[];
}

const initialState: ExpertPanelsState = {
  panels: []
};

const expertPanelsSlice = createSlice({
  name: 'expertPanels',
  initialState,
  reducers: {
    setPanels: (state, { payload }: PayloadAction<string[]>) => {
      state.panels = payload;
    }
  }
});

export const { setPanels } = expertPanelsSlice.actions;
export default expertPanelsSlice.reducer;
