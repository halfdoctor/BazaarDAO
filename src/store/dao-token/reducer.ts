import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  formatNumber: number;
};

interface daoTokenState {
  votingToken: string;
  tokenInfo: TokenInfo | null;
};

const initialState: daoTokenState = {
  votingToken: '',
  tokenInfo: null
};

const daoTokenSlice = createSlice({
  name: 'dao-token',
  initialState,
  reducers: {
    setVotingToken: (state, { payload }: PayloadAction<string>) => {
      state.votingToken = payload;
    },
    setTokenInfo: (state, { payload }: PayloadAction<TokenInfo | null>) => {
      state.tokenInfo = payload;
    },
  }
});

export const { setVotingToken, setTokenInfo } = daoTokenSlice.actions;
export default daoTokenSlice.reducer;
