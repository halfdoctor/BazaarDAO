import { SavingBalanceDetails, VotingDelegationInfo } from '@q-dev/q-js-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QVBalance extends SavingBalanceDetails {
  interestRatePercentage: number;
  yearlyExpectedEarnings: number;
  qHolderRewardPool: string;
}

interface DelegationStakeInfo {
  totalDelegatedStake: string;
  delegatableAmount: string;
  totalStakeReward: number;
}

interface QVaultState {
  walletBalance: string;
  vaultBalance: string;
  maxWithdrawalBalance: string;

  votingWeight: string;
  votingLockingEnd: string;
  deposit: number;

  delegationInfo: VotingDelegationInfo;
  qvBalance: QVBalance;

  delegationStakeInfo: DelegationStakeInfo;
  delegationStakeInfoLoading: boolean;

  qVaultMinimumTimeLock: string;
}

const initialState: QVaultState = {
  walletBalance: '0',
  vaultBalance: '0',
  votingWeight: '0',
  votingLockingEnd: '0',
  deposit: 0,
  maxWithdrawalBalance: '0',

  delegationStakeInfo: {
    totalDelegatedStake: '0',
    delegatableAmount: '0',
    totalStakeReward: 0,
  },
  delegationStakeInfoLoading: true,
  delegationInfo: {
    isPending: false,
    receivedWeight: '0',
    votingAgent: '',
    votingAgentPassOverTime: '0',
  },
  qvBalance: {
    compoundRate: '0',
    currentBalance: '0',
    interestRate: '0',
    lastUpdateOfCompoundRate: '0',
    normalizedBalance: '0',
    interestRatePercentage: 0,
    yearlyExpectedEarnings: 0,
    qHolderRewardPool: '0',
  },

  qVaultMinimumTimeLock: '0',
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

    setVotingWeight (state, { payload }: PayloadAction<string>) {
      state.votingWeight = payload;
    },

    setVotingLockingEnd (state, { payload }: PayloadAction<string>) {
      state.votingLockingEnd = payload;
    },

    setQVBalance (state, { payload }: PayloadAction<QVBalance>) {
      state.qvBalance = payload;
    },

    setDelegationStakeInfo (state, { payload }: PayloadAction<DelegationStakeInfo>) {
      state.delegationStakeInfo = payload;
      state.delegationStakeInfoLoading = false;
    },

    setQVaultMinimumTimeLock (state, { payload }: PayloadAction<string>) {
      state.qVaultMinimumTimeLock = payload;
    },

    setMaxWithdrawalBalance (state, { payload }: PayloadAction<string>) {
      state.maxWithdrawalBalance = payload;
    },

    setDelegationInfo (state, { payload }: PayloadAction<VotingDelegationInfo>) {
      state.delegationInfo = payload;
    }
  }
});

export const {
  setVaultBalance,
  setWalletBalance,
  setVotingWeight,
  setVotingLockingEnd,
  setQVBalance,
  setDelegationStakeInfo,
  setQVaultMinimumTimeLock,
  setDelegationInfo,
  setMaxWithdrawalBalance
} = qVaultSlice.actions;
export default qVaultSlice.reducer;
