import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QVaultState {
  walletBalance: string;
  vaultBalance: string;
  withdrawalBalance: string;
  lockedBalance: string;
  deposit: number;
  vaultTimeLock: string;
}

const initialState: QVaultState = {
  walletBalance: '0',
  vaultBalance: '0',
  deposit: 0,
  withdrawalBalance: '0',
  lockedBalance: '0',
  vaultTimeLock: '0',
};

const qVaultSlice = createSlice({
  name: 'q-vault',
  initialState,
  reducers: {
    setVaultBalance (state, { payload }: PayloadAction<string>) {
      state.vaultBalance = payload;
    },

    setWalletBalance (state, { payload }: PayloadAction<string>) {
      state.walletBalance = payload;
    },

    setVaultTimeLock (state, { payload }: PayloadAction<string>) {
      state.vaultTimeLock = payload;
    },

    setWithdrawalBalance (state, { payload }: PayloadAction<string>) {
      state.withdrawalBalance = payload;
    },

    setLockedBalance (state, { payload }: PayloadAction<string>) {
      state.lockedBalance = payload;
    },
  }
});

export const {
  setVaultBalance,
  setWalletBalance,
  setVaultTimeLock,
  setWithdrawalBalance,
  setLockedBalance
} = qVaultSlice.actions;
export default qVaultSlice.reducer;
