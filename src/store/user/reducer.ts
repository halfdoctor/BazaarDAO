import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ZERO_ADDRESS } from 'constants/boundaries';

interface UserState {
  address: string;
  balance: string;
  chainId: number;
}

const initialState: UserState = {
  address: ZERO_ADDRESS,
  balance: '0',
  chainId: 0
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },

    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },

    setChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },
  }
});

export const {
  setAddress,
  setBalance,
  setChainId
} = userSlice.actions;
export default userSlice.reducer;
