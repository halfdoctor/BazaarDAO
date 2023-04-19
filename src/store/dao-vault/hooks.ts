import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { fillArray } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { getBalanceOfErc20 } from 'helpers/erc-20';
import { getBalanceOfErc721, getTokenOfOwnerByIndexErc721 } from 'helpers/erc-721';

import {
  setChainBalance,
  setLockedBalance,
  setVaultBalance,
  setVaultTimeLock,
  setWalletBalance,
  setWalletNftsList,
  setWithdrawalBalance,
  setWithdrawalNftsList
} from './reducer';

import { getState, useAppSelector } from 'store';
import { Q_TOKEN_INFO } from 'store/dao/hooks';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';

export function useDaoVault () {
  const dispatch = useDispatch();
  const { currentProvider } = useWeb3Context();
  const vaultBalance = useAppSelector(({ qVault }) => qVault.vaultBalance);
  const walletBalance = useAppSelector(({ qVault }) => qVault.walletBalance);
  const chainBalance = useAppSelector(({ qVault }) => qVault.chainBalance);
  const walletNftsList = useAppSelector(({ qVault }) => qVault.walletNftsList);
  const lockedBalance = useAppSelector(({ qVault }) => qVault.lockedBalance);
  const withdrawalBalance = useAppSelector(({ qVault }) => qVault.withdrawalBalance);
  const withdrawalNftsList = useAppSelector(({ qVault }) => qVault.withdrawalNftsList);
  const vaultTimeLock = useAppSelector(({ qVault }) => qVault.vaultTimeLock);

  async function loadWalletBalance () {
    try {
      const { tokenInfo } = getState().dao;
      const userAddress = currentProvider.selectedAddress;
      const balance = tokenInfo.address && userAddress
        ? tokenInfo.address === ETHEREUM_ADDRESS
          ? await currentProvider.currentProvider?.getBalance(userAddress)
          : tokenInfo.isErc721
            ? await getBalanceOfErc721(userAddress)
            : await getBalanceOfErc20(userAddress)
        : '0';
      dispatch(setWalletBalance(fromWeiWithDecimals(balance?.toString() || '0', tokenInfo.decimals)));
    } catch (error) {
      captureError(error);
      dispatch(setWalletBalance('0'));
    }
  }
  async function loadChainBalance () {
    try {
      const userAddress = currentProvider.selectedAddress;
      if (!userAddress || !currentProvider.currentProvider) {
        dispatch(setChainBalance('0'));
        return;
      };
      const balance = await currentProvider.currentProvider.getBalance(userAddress);
      dispatch(setChainBalance(fromWeiWithDecimals(balance.toString(), Q_TOKEN_INFO.decimals)));
    } catch (error) {
      captureError(error);
      dispatch(setChainBalance('0'));
    }
  }

  async function loadVaultBalance (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().dao;
      if (!daoInstance || !votingToken || !currentProvider?.selectedAddress) {
        dispatch(setVaultBalance('0'));
        return;
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const balance = tokenInfo.isErc721
        ? await daoVaultInstance.instance.getUserVotingPower(address || currentProvider.selectedAddress, votingToken)
        : await daoVaultInstance.instance.userTokenBalance(address || currentProvider.selectedAddress, votingToken);
      dispatch(setVaultBalance(fromWeiWithDecimals(balance.toString(), tokenInfo.decimals)));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadWithdrawalAmount (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().dao;
      if (!daoInstance || !votingToken || !currentProvider?.selectedAddress) {
        dispatch(setWithdrawalBalance('0'));
        dispatch(setLockedBalance('0'));
        dispatch(setVaultTimeLock('0'));
        return;
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();

      const balance = await daoVaultInstance
        .getTimeLockInfo(address || currentProvider.selectedAddress, votingToken);
      dispatch(setWithdrawalBalance((fromWeiWithDecimals(balance.withdrawalAmount.toString(), tokenInfo.decimals))));
      dispatch(setLockedBalance(tokenInfo.isErc721 && Number(balance.unlockTime)
        ? '1'
        : fromWeiWithDecimals(balance.lockedAmount.toString(), tokenInfo.decimals)));
      dispatch(setVaultTimeLock(balance.unlockTime.toString()));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadVaultNftsList (address?: string) {
    try {
      const { tokenInfo } = getState().dao;
      if (!daoInstance || !tokenInfo.address || !tokenInfo.isErc721 || !currentProvider?.selectedAddress) {
        dispatch(setWithdrawalNftsList([]));
        return;
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const withdrawalNftsList = await daoVaultInstance.instance
        .getUserNFTs(address || currentProvider.selectedAddress, tokenInfo.address);
      dispatch(setWithdrawalNftsList(withdrawalNftsList.map(item => item.toString())));
    } catch (error) {
      captureError(error);
    }
  }
  async function loadWalletNftsList (address?: string) {
    try {
      const { tokenInfo } = getState().dao;
      const { walletBalance } = getState().qVault;
      if (!daoInstance || !tokenInfo.address || !tokenInfo.isErc721) {
        dispatch(setWalletNftsList([]));
        return;
      };
      const walletNftsList = await Promise.all(fillArray(Number(walletBalance))
        .map(item => getTokenOfOwnerByIndexErc721(address || currentProvider.selectedAddress, item)));
      dispatch(setWalletNftsList(walletNftsList));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadAllBalances () {
    try {
      await Promise.all([
        loadWalletBalance(),
        loadChainBalance(),
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

    receipt.wait().finally(
      () => {
        loadWalletBalance();
        loadVaultBalance();
      }
    );

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

    receipt.wait().finally(
      () => {
        loadWalletBalance();
        loadVaultBalance();
      }
    );

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
    chainBalance,

    loadWalletBalance: useCallback(loadWalletBalance, [currentProvider]),
    loadChainBalance: useCallback(loadChainBalance, [currentProvider]),
    loadVaultBalance: useCallback(loadVaultBalance, [currentProvider]),
    loadAllBalances: useCallback(loadAllBalances, [currentProvider]),
    depositToVault: useCallback(depositToVault, [currentProvider]),
    withdrawFromVault: useCallback(withdrawFromVault, [currentProvider]),
    loadVaultNftsList: useCallback(loadVaultNftsList, [currentProvider]),
    loadWithdrawalAmount: useCallback(loadWithdrawalAmount, [currentProvider]),
  };
}
