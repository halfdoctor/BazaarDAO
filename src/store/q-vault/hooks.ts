import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { calculateInterestRate } from '@q-dev/utils';
import { fromWei, toWei } from 'web3-utils';

import {
  setDelegationInfo,
  setDelegationStakeInfo,
  setQVaultMinimumTimeLock,
  setQVBalance,
  setVaultBalance,
  setVotingLockingEnd,
  setVotingWeight,
  setWalletBalance
} from './reducer';

import { getState, getUserAddress, useAppSelector } from 'store';
import { useBaseVotingWeightInfo } from 'store/proposals/hooks';

import { getQVaultInstance, getVotingWeightProxyInstance } from 'contracts/contract-instance';
import { countTotalStakeReward, getQHolderRewardPool } from 'contracts/helpers/q-vault-helper';

import { dateToUnix } from 'utils/date';
import { captureError } from 'utils/errors';

export function useQVault () {
  const dispatch = useDispatch();
  const { getBaseVotingWeightInfo } = useBaseVotingWeightInfo();

  const vaultBalance = useAppSelector(({ qVault }) => qVault.vaultBalance);
  const walletBalance = useAppSelector(({ qVault }) => qVault.walletBalance);

  const votingWeight = useAppSelector(({ qVault }) => qVault.votingWeight);
  const votingLockingEnd = useAppSelector(({ qVault }) => qVault.votingLockingEnd);
  const isVotingWeightUnlocked = useAppSelector(({ qVault }) => Number(qVault.votingLockingEnd) < dateToUnix());

  const delegationInfo = useAppSelector(({ qVault }) => qVault.delegationInfo);
  const delegationStakeInfo = useAppSelector(({ qVault }) => qVault.delegationStakeInfo);
  const delegationStakeInfoLoading = useAppSelector(({ qVault }) => qVault.delegationStakeInfoLoading);
  const qvBalance = useAppSelector(({ qVault }) => qVault.qvBalance);

  const qVaultMinimumTimeLock = useAppSelector(({ qVault }) => qVault.qVaultMinimumTimeLock);

  async function loadWalletBalance () {
    try {
      const balance = await window.web3.eth.getBalance(getUserAddress());
      dispatch(setWalletBalance(fromWei(balance)));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadVaultBalance (address?: string) {
    try {
      const contract = await getQVaultInstance();
      const balance = await contract.balanceOf(address ?? getUserAddress());
      dispatch(setVaultBalance(fromWei(balance)));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadAllBalances () {
    try {
      await Promise.all([
        loadWalletBalance(),
        loadVaultBalance(),
        getBaseVotingWeightInfo(),
      ]);
    } catch (error) {
      captureError(error);
    }
  }

  async function loadLockInfo (address: string) {
    try {
      const contract = await getQVaultInstance();
      const lockInfo = await contract.getLockInfo(address);

      dispatch(setVotingWeight(fromWei(lockInfo.lockedAmount)));
      dispatch(setVotingLockingEnd(lockInfo.lockedUntil));
    } catch (error) {
      captureError(error);
    }
  }

  async function depositToVault ({ address, amount }: { address: string; amount: string }) {
    const contract = await getQVaultInstance();
    const receipt = await contract.deposit({
      value: toWei(amount),
      from: address,
    });

    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
      });

    return receipt;
  }

  async function sendToVault ({ address, amount }: {
    address: string;
    amount: string;
  }) {
    const contract = await getQVaultInstance();
    const receipt = await contract.transfer(address, toWei(amount));

    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
      });

    return receipt;
  }

  async function withdrawFromVault ({ address, amount }: {
    address: string;
    amount: string;
  }) {
    const contract = await getQVaultInstance();
    const receipt = await contract.withdraw(toWei(amount), { from: address });

    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
      });

    return receipt;
  }

  async function delegateStake ({ addresses, stakes }: {
    addresses: string[];
    stakes: string[];
  }) {
    const userAddress = getUserAddress();
    const contract = await getQVaultInstance();
    const receipt = await contract.delegateStake(addresses, stakes, { from: userAddress });

    receipt.promiEvent
      .once('receipt', () => {
        loadDelegationStakeInfo();
        loadWalletBalance();
        loadDelegationInfo(userAddress);
      });

    return receipt;
  }

  async function lockAmount ({ address, amount }: {
    address: string;
    amount: string;
  }) {
    const contract = await getQVaultInstance();
    const receipt = await contract.lock(toWei(amount), { from: address });

    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
        loadLockInfo(address);
        loadDelegationInfo(address);
      });

    return receipt;
  }

  async function unlockAmount ({ address, amount }: {
    address: string;
    amount: string;
  }) {
    const contract = await getQVaultInstance();
    const receipt = await contract.unlock(toWei(amount), { from: address });

    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
        loadLockInfo(address);
        loadDelegationInfo(address);
      });

    return receipt;
  }

  async function loadDelegationStakeInfo () {
    try {
      const userAddress = getUserAddress();
      const contract = await getQVaultInstance();
      const delegationsList = await contract.getDelegationsList(userAddress);
      const totalDelegatedStake = await contract.getTotalDelegatedStake(userAddress);
      const delegatableAmount = await contract.getDelegatableAmount(userAddress);

      dispatch(setDelegationStakeInfo({
        totalDelegatedStake: fromWei(totalDelegatedStake),
        delegatableAmount: fromWei(delegatableAmount),
        totalStakeReward: countTotalStakeReward(delegationsList),
      }));
    } catch (error) {
      captureError(error);
    }
  }

  async function claimStakeDelegatorReward () {
    const userAddress = getUserAddress();
    const contract = await getQVaultInstance();
    const receipt = await contract.claimStakeDelegatorReward({ from: userAddress });

    receipt.promiEvent
      .once('receipt', () => {
        loadDelegationStakeInfo();
        loadWalletBalance();
      });

    return receipt;
  }

  async function loadQVBalanceDetails () {
    try {
      const userAddress = getUserAddress();
      const contract = await getQVaultInstance();
      const balanceDetailsData = await contract.getBalanceDetails(userAddress);
      const qHolderRewardPool = await getQHolderRewardPool();

      const { vaultBalance } = getState().qVault;
      const interestRatePercentage = calculateInterestRate(Number(balanceDetailsData.interestRate));

      dispatch(setQVBalance({
        ...balanceDetailsData,
        interestRatePercentage,
        qHolderRewardPool,
        yearlyExpectedEarnings: Number(vaultBalance) * interestRatePercentage / 100
      }));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadDelegationInfo (address: string) {
    try {
      const contract = await getVotingWeightProxyInstance();
      const info = await contract.getDelegationInfo(address);
      dispatch(setDelegationInfo({ ...info }));
    } catch (error) {
      captureError(error);
    }
  }

  async function announceNewVotingAgent (address: string) {
    const userAddress = getUserAddress();
    const contract = await getVotingWeightProxyInstance();
    const receipt = await contract.announceNewVotingAgent(address);

    receipt.promiEvent
      .once('receipt', () => {
        loadDelegationInfo(userAddress);
        loadWalletBalance();
      });

    return receipt;
  }

  async function setNewVotingAgent () {
    const userAddress = getUserAddress();
    const contract = await getVotingWeightProxyInstance();
    const receipt = await contract.setNewVotingAgent();

    receipt.promiEvent
      .once('receipt', () => {
        loadDelegationInfo(userAddress);
        loadWalletBalance();
      });

    return receipt;
  }

  async function loadMinimumQVaultTimeLock (address: string) {
    try {
      const contract = await getQVaultInstance();
      const data = await contract.getMinimumBalance(address, dateToUnix());
      dispatch(setQVaultMinimumTimeLock(fromWei(data)));
    } catch (error) {
      captureError(error);
    }
  }

  return {
    vaultBalance,
    walletBalance,
    votingWeight,
    votingLockingEnd,
    isVotingWeightUnlocked,
    delegationInfo,
    qvBalance,
    qVaultMinimumTimeLock,
    delegationStakeInfo,
    delegationStakeInfoLoading,

    loadWalletBalance: useCallback(loadWalletBalance, []),
    loadVaultBalance: useCallback(loadVaultBalance, []),
    loadAllBalances: useCallback(loadAllBalances, []),
    loadLockInfo: useCallback(loadLockInfo, []),
    depositToVault: useCallback(depositToVault, []),
    sendToVault: useCallback(sendToVault, []),
    withdrawFromVault: useCallback(withdrawFromVault, []),
    delegateStake: useCallback(delegateStake, []),
    lockAmount: useCallback(lockAmount, []),
    unlockAmount: useCallback(unlockAmount, []),
    loadDelegationInfo: useCallback(loadDelegationInfo, []),
    loadDelegationStakeInfo: useCallback(loadDelegationStakeInfo, []),
    claimStakeDelegatorReward: useCallback(claimStakeDelegatorReward, []),
    loadQVBalanceDetails: useCallback(loadQVBalanceDetails, []),
    announceNewVotingAgent: useCallback(announceNewVotingAgent, []),
    setNewVotingAgent: useCallback(setNewVotingAgent, []),
    loadMinimumQVaultTimeLock: useCallback(loadMinimumQVaultTimeLock, []),
  };
}
