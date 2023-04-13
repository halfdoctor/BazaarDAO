import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { TimeLockInfoStruct } from 'typings/dao';
import { toWei } from 'web3-utils';

import {
  setLockedBalance,
  setVaultBalance,
  setVaultTimeLock,
  setWalletBalance,
  setWithdrawalBalance
} from './reducer';

import { getState, getUserAddress, useAppSelector } from 'store';

import { daoInstance, getErc20Contract } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { fromWeiWithDecimals } from 'utils/numbers';

export function useDaoVault () {
  const dispatch = useDispatch();
  const vaultBalance = useAppSelector(({ qVault }) => qVault.vaultBalance);
  const walletBalance = useAppSelector(({ qVault }) => qVault.walletBalance);
  const lockedBalance = useAppSelector(({ qVault }) => qVault.lockedBalance);
  const withdrawalBalance = useAppSelector(({ qVault }) => qVault.withdrawalBalance);
  const vaultTimeLock = useAppSelector(({ qVault }) => qVault.vaultTimeLock);

  async function loadWalletBalance () {
    try {
      const { tokenInfo } = getState().dao;
      const balance = tokenInfo.address
        ? tokenInfo.address === ETHEREUM_ADDRESS
          ? await window.web3.eth.getBalance(getUserAddress())
          : await getErc20Contract(tokenInfo.address).methods.balanceOf(getUserAddress()).call()
        : '0';
      dispatch(setWalletBalance(fromWeiWithDecimals(balance, tokenInfo.decimals)));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadVaultBalance (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().dao;
      if (!daoInstance || !votingToken) return;
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const balance = await daoVaultInstance.instance.methods
        .userTokenBalance(address || getUserAddress(), votingToken)
        .call();
      dispatch(setVaultBalance(fromWeiWithDecimals(balance, tokenInfo.decimals)));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadWithdrawalAmount (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().dao;
      if (!daoInstance || !votingToken) return;
      const daoVaultInstance = await daoInstance.getVaultInstance();

      const balance = await daoVaultInstance
        .getTimeLockInfo(address || getUserAddress(), votingToken) as TimeLockInfoStruct;
      dispatch(setWithdrawalBalance((fromWeiWithDecimals(balance.withdrawalAmount, tokenInfo.decimals))));
      dispatch(setLockedBalance(fromWeiWithDecimals(balance.lockedAmount, tokenInfo.decimals)));
      dispatch(setVaultTimeLock(balance.unlockTime));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadAllBalances () {
    try {
      await Promise.all([
        loadWalletBalance(),
        loadVaultBalance(),
        loadWithdrawalAmount(),
      ]);
    } catch (error) {
      captureError(error);
    }
  }

  async function depositToVault ({ address, amount }: { address: string; amount: string }) {
    if (!daoInstance) return;
    const { tokenInfo } = getState().dao;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const receipt = await daoVaultInstance.deposit(tokenInfo.address, toWei(amount),
      { from: address, ...(tokenInfo.isNative ? { value: toWei(amount) } : {}) });

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
    if (!daoInstance) return;
    const { votingToken } = getState().dao;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const receipt = await daoVaultInstance.withdraw(votingToken, toWei(amount), { from: address });
    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
      });

    return receipt;
  }

  return {
    vaultBalance,
    walletBalance,
    vaultTimeLock,
    lockedBalance,
    withdrawalBalance,
    loadWalletBalance: useCallback(loadWalletBalance, []),
    loadVaultBalance: useCallback(loadVaultBalance, []),
    loadAllBalances: useCallback(loadAllBalances, []),
    depositToVault: useCallback(depositToVault, []),
    withdrawFromVault: useCallback(withdrawFromVault, []),
    loadWithdrawalAmount: useCallback(loadWithdrawalAmount, []),
  };
}
