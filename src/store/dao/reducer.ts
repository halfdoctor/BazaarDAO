import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EMPTY_TOKEN_INFO } from './hooks';

// TODO: create different token type
export interface TokenInfo {
  name: string;
  symbol: string;
  allowance: string;
  decimals: number;
  isNative: boolean;
  isErc721?: boolean;
  isErc721Approved?: boolean;
  address: string;
  totalSupply: string;
  totalSupplyCap: string;
  owner: string;
};

interface DAOState {
  daoAddress: string;
  votingToken: string;
  tokenInfo: TokenInfo;
};

const initialState: DAOState = {
  daoAddress: '',
  votingToken: '',
  tokenInfo: EMPTY_TOKEN_INFO
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
