import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { fillArray } from '@q-dev/utils';
import { TimeLockInfoStruct } from 'typings/dao';

import {
  setLockedBalance,
  setVaultBalance,
  setVaultTimeLock,
  setWalletBalance,
  setWalletNftsList,
  setWithdrawalBalance,
  setWithdrawalNftsList
} from './reducer';

import { getState, getUserAddress, useAppSelector } from 'store';

import { daoInstance, getErc20Contract, getErc721Contract } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';

export function useDaoVault () {
  const dispatch = useDispatch();
  const vaultBalance = useAppSelector(({ qVault }) => qVault.vaultBalance);
  const walletBalance = useAppSelector(({ qVault }) => qVault.walletBalance);
  const walletNftsList = useAppSelector(({ qVault }) => qVault.walletNftsList);
  const lockedBalance = useAppSelector(({ qVault }) => qVault.lockedBalance);
  const withdrawalBalance = useAppSelector(({ qVault }) => qVault.withdrawalBalance);
  const withdrawalNftsList = useAppSelector(({ qVault }) => qVault.withdrawalNftsList);
  const vaultTimeLock = useAppSelector(({ qVault }) => qVault.vaultTimeLock);

  async function loadWalletBalance () {
    try {
      const { tokenInfo } = getState().dao;
      const balance = tokenInfo.address
        ? tokenInfo.address === ETHEREUM_ADDRESS
          ? await window.web3.eth.getBalance(getUserAddress())
          : tokenInfo.isErc721
            ? await getErc721Contract(tokenInfo.address).methods.balanceOf(getUserAddress()).call()
            : await getErc20Contract(tokenInfo.address).methods.balanceOf(getUserAddress()).call()
        : '0';
      dispatch(setWalletBalance(fromWeiWithDecimals(balance, tokenInfo.decimals)));
    } catch (error) {
      captureError(error);
      dispatch(setWalletBalance('0'));
    }
  }

  async function loadVaultBalance (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().dao;
      if (!daoInstance || !votingToken) return;
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const balance = tokenInfo.isErc721
        ? await daoVaultInstance.instance.methods.getUserVotingPower(address || getUserAddress(), votingToken)
          .call()
        : await daoVaultInstance.instance.methods
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
      dispatch(setLockedBalance(tokenInfo.isErc721 && Number(balance.unlockTime)
        ? '1'
        : fromWeiWithDecimals(balance.lockedAmount, tokenInfo.decimals)));
      dispatch(setVaultTimeLock(balance.unlockTime));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadVaultNftsList (address?: string) {
    try {
      const { tokenInfo } = getState().dao;
      if (!daoInstance || !tokenInfo.address || !tokenInfo.isErc721) return;
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const withdrawalNftsList = await daoVaultInstance.instance.methods
        .getUserNFTs(address || getUserAddress(), tokenInfo.address).call();
      dispatch(setWithdrawalNftsList(withdrawalNftsList));
    } catch (error) {
      captureError(error);
    }
  }
  async function loadWalletNftsList (address?: string) {
    try {
      const { tokenInfo } = getState().dao;
      const { walletBalance } = getState().qVault;
      if (!daoInstance || !tokenInfo.address || !tokenInfo.isErc721) return;
      const tokenContract = getErc721Contract(tokenInfo.address);
      const walletNftsList = await Promise.all(fillArray(Number(walletBalance))
        .map(item => tokenContract.methods.tokenOfOwnerByIndex(address || getUserAddress(), item).call()));
      dispatch(setWalletNftsList(walletNftsList));
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
        loadVaultNftsList(),
        loadWalletNftsList()
      ]);
    } catch (error) {
      captureError(error);
    }
  }

  async function depositToVault ({ address, amount, erc721Id }: {
    address: string;
    amount?: string;
    erc721Id?: string; }) {
    if (!daoInstance) return;
    const { tokenInfo } = getState().dao;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const receipt = tokenInfo.isErc721 && erc721Id
      ? await daoVaultInstance.depositNFT(
        tokenInfo.address,
        erc721Id,
        { from: address }
      )
      : await daoVaultInstance.deposit(
        tokenInfo.address,
        toWeiWithDecimals(amount || '0', tokenInfo.decimals),
        {
          from: address,
          ...(tokenInfo.isNative
            ? { value: toWeiWithDecimals(amount || '0', tokenInfo.decimals), }
            : {})
        }
      );

    receipt.promiEvent
      .once('receipt', () => {
        loadWalletBalance();
        loadVaultBalance();
      });

    return receipt;
  }

  async function withdrawFromVault ({ address, amount, erc721Id }: {
    address: string;
    amount?: string;
    erc721Id?: string;
  }) {
    if (!daoInstance) return;
    const { votingToken, tokenInfo } = getState().dao;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const receipt = tokenInfo.isErc721 && erc721Id
      ? await daoVaultInstance.withdrawNFT(votingToken, erc721Id, { from: address })
      : await daoVaultInstance.withdraw(
        votingToken,
        toWeiWithDecimals(amount || '0', tokenInfo.decimals),
        { from: address }
      );

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
    walletNftsList,
    withdrawalNftsList,

    loadWalletBalance: useCallback(loadWalletBalance, []),
    loadVaultBalance: useCallback(loadVaultBalance, []),
    loadAllBalances: useCallback(loadAllBalances, []),
    depositToVault: useCallback(depositToVault, []),
    withdrawFromVault: useCallback(withdrawFromVault, []),
    loadVaultNftsList: useCallback(loadVaultNftsList, []),
    loadWithdrawalAmount: useCallback(loadWithdrawalAmount, []),
  };
}
