import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  tokenInfo: {
    name: '',
    symbol: '',
    address: '',
    decimals: 0,
    isNative: true,
    isErc721: false,
    allowance: '0',
    totalSupply: '0',
    totalSupplyCap: '0',
    owner: '',
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
