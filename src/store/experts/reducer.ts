import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExpertsState {
  isEpqfiMember: boolean;
  isEpdrMember: boolean;
  isEprsMember: boolean;

  epqfiMembers: string[];
  epqfiMembersLoading: boolean;
  epqfiMembersError: unknown;

  epdrMembers: string[];
  epdrMembersLoading: boolean;
  epdrMembersError: unknown;

  eprsMembers: string[];
  eprsMembersLoading: boolean;
  eprsMembersError: unknown;
};

const initialState: ExpertsState = {
  isEpqfiMember: false,
  isEpdrMember: false,
  isEprsMember: false,

  epqfiMembers: [],
  epqfiMembersLoading: true,
  epqfiMembersError: null,

  epdrMembers: [],
  epdrMembersLoading: true,
  epdrMembersError: null,

  eprsMembers: [],
  eprsMembersLoading: true,
  eprsMembersError: null
};

const expertsSlice = createSlice({
  name: 'experts',
  initialState,
  reducers: {
    setEpqfiMember: (state, { payload }: PayloadAction<boolean>) => {
      state.isEpqfiMember = payload;
    },

    setEpdrMember: (state, { payload }: PayloadAction<boolean>) => {
      state.isEpdrMember = payload;
    },

    setEprsMember: (state, { payload }: PayloadAction<boolean>) => {
      state.isEprsMember = payload;
    },

    setEpqfiMembers: (state, { payload }: PayloadAction<string[]>) => {
      state.epqfiMembers = payload;
      state.epqfiMembersLoading = false;
      state.epqfiMembersError = '';
    },

    setEpqfiMembersError: (state, { payload }: PayloadAction<unknown>) => {
      state.epqfiMembersLoading = false;
      state.epqfiMembersError = payload;
    },

    setEpdrMembers: (state, { payload }: PayloadAction<string[]>) => {
      state.epdrMembers = payload;
      state.epdrMembersLoading = false;
      state.epdrMembersError = '';
    },

    setEpdrMembersError: (state, { payload }: PayloadAction<unknown>) => {
      state.epdrMembersLoading = false;
      state.epdrMembersError = payload;
    },

    setEprsMembers: (state, { payload }: PayloadAction<string[]>) => {
      state.eprsMembers = payload;
      state.eprsMembersLoading = false;
      state.eprsMembersError = '';
    },

    setEprsMembersError: (state, { payload }: PayloadAction<unknown>) => {
      state.eprsMembersLoading = false;
      state.eprsMembersError = payload;
    }
  }
});

export const {
  setEpqfiMember,
  setEpdrMember,
  setEprsMember,
  setEpqfiMembers,
  setEpqfiMembersError,
  setEpdrMembers,
  setEpdrMembersError,
  setEprsMembers,
  setEprsMembersError
} = expertsSlice.actions;
export default expertsSlice.reducer;
