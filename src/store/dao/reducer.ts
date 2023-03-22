import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TokenInfo {
  name: string;
  symbol: string;
  address: string;
  allowance: string;
  decimals: number;
  isNative: boolean;
};

interface ExpertsState {
  daoAddress: string;
  votingToken: string;
  tokenInfo:TokenInfo;
};

const initialState: ExpertsState = {
  daoAddress: '',
  votingToken: '',
  tokenInfo: {
    name: '',
    symbol: '',
    address: '',
    decimals: 0,
    isNative: true,
    allowance: '0',
  }
};

const expertsSlice = createSlice({
  name: 'dao',
  initialState,
  reducers: {
    setDaoAddress: (state, { payload }: PayloadAction<string>) => {
      state.daoAddress = payload;
    },
    setVotingToken: (state, { payload }: PayloadAction<string>) => {
      state.votingToken = payload;
    },
    setTokenInfo: (state, { payload }: PayloadAction<TokenInfo>) => {
      state.tokenInfo = payload;
    },
  }
});

export const { setDaoAddress, setVotingToken, setTokenInfo } = expertsSlice.actions;
export default expertsSlice.reducer;
