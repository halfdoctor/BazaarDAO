import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProposalsState {
  panelsName: string[];
}

const initialState: ProposalsState = {
  panelsName: [],
};

const proposalsSlice = createSlice({
  name: 'dao-proposals',
  initialState,
  reducers: {
    setPanelsName: (state, { payload }: PayloadAction<string[]>) => {
      state.panelsName = payload;
    },
  }
});

export const { setPanelsName } = proposalsSlice.actions;
export default proposalsSlice.reducer;
