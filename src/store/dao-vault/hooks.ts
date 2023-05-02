import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { fillArray } from '@q-dev/utils';
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
import { Q_TOKEN_INFO } from 'store/dao-token/hooks';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';
import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';

export function useDaoVault () {
  const dispatch = useDispatch();
  const vaultBalance: string = useAppSelector(({ qVault }) => qVault.vaultBalance);
  const walletBalance: string = useAppSelector(({ qVault }) => qVault.walletBalance);
  const chainBalance: string = useAppSelector(({ qVault }) => qVault.chainBalance);
  const walletNftsList: string[] = useAppSelector(({ qVault }) => qVault.walletNftsList);
  const lockedBalance: string = useAppSelector(({ qVault }) => qVault.lockedBalance);
  const withdrawalBalance: string = useAppSelector(({ qVault }) => qVault.withdrawalBalance);
  const withdrawalNftsList: string[] = useAppSelector(({ qVault }) => qVault.withdrawalNftsList);
  const vaultTimeLock: string = useAppSelector(({ qVault }) => qVault.vaultTimeLock);

  async function loadWalletBalance () {
    try {
      const { tokenInfo } = getState().daoToken;
      const { currentProvider } = getState().provider;
      // TODO: create class with error check
      if (!tokenInfo || !currentProvider?.selectedAddress) throw Error();

      const userAddress = currentProvider.selectedAddress;
      const balance = tokenInfo.address && userAddress
        ? tokenInfo.address === ETHEREUM_ADDRESS
          ? await currentProvider.provider?.getBalance(userAddress)
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
      const { currentProvider } = getState().provider;

      const userAddress = currentProvider?.selectedAddress;
      if (!userAddress || !currentProvider?.provider) {
        throw Error(); // TODO: create class with error check
      };
      const balance = await currentProvider.provider.getBalance(userAddress);
      dispatch(setChainBalance(fromWeiWithDecimals(balance.toString(), Q_TOKEN_INFO.decimals)));
    } catch (error) {
      captureError(error);
      dispatch(setChainBalance('0'));
    }
  }

  async function loadVaultBalance (address?: string) {
    try {
      const { currentProvider } = getState().provider;
      const { votingToken, tokenInfo } = getState().daoToken;
      if (!daoInstance || !votingToken || !currentProvider?.selectedAddress || !tokenInfo) {
        throw Error(); // TODO: create class with error check
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const balance = tokenInfo.isErc721
        ? await daoVaultInstance.instance.getUserVotingPower(address || currentProvider.selectedAddress, votingToken)
        : await daoVaultInstance.instance.userTokenBalance(address || currentProvider.selectedAddress, votingToken);
      dispatch(setVaultBalance(fromWeiWithDecimals(balance.toString(), tokenInfo.decimals)));
    } catch (error) {
      captureError(error);
      dispatch(setVaultBalance('0'));
    }
  }

  async function loadWithdrawalAmount (address?: string) {
    try {
      const { currentProvider } = getState().provider;
      const { votingToken, tokenInfo } = getState().daoToken;
      if (!daoInstance || !votingToken || !tokenInfo || !currentProvider?.selectedAddress) {
        throw Error(); // TODO: create class with error check
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
      dispatch(setWithdrawalBalance('0'));
      dispatch(setLockedBalance('0'));
      dispatch(setVaultTimeLock('0'));
    }
  }

  async function loadVaultNftsList (address?: string) {
    try {
      const { currentProvider } = getState().provider;
      const { tokenInfo } = getState().daoToken;
      if (!daoInstance || !tokenInfo || !tokenInfo?.isErc721 || !currentProvider?.selectedAddress) {
        throw Error(); // TODO: create class with error check
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const withdrawalNftsList = await daoVaultInstance.instance
        .getUserNFTs(address || currentProvider.selectedAddress, tokenInfo.address);
      dispatch(setWithdrawalNftsList(withdrawalNftsList.map(item => item.toString())));
    } catch (error) {
      captureError(error);
      dispatch(setWithdrawalNftsList([]));
    }
  }

  async function loadWalletNftsList (address?: string) {
    try {
      const { currentProvider } = getState().provider;
      const { tokenInfo } = getState().daoToken;
      const { walletBalance } = getState().qVault;
      const searchAddress = address || currentProvider?.selectedAddress;
      if (!tokenInfo?.isErc721 || !searchAddress) {
        throw Error(); // TODO: create class with error check
      };
      const walletNftsList = await Promise.all(fillArray(Number(walletBalance))
        .map(item => getTokenOfOwnerByIndexErc721(searchAddress, item)));
      dispatch(setWalletNftsList(walletNftsList));
    } catch (error) {
      captureError(error);
      dispatch(setWalletNftsList([]));
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
    address?: string;
    amount?: string;
    erc721Id?: string; }) {
    const { tokenInfo } = getState().daoToken;
    if (!daoInstance || !tokenInfo || !address) return;
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
    address?: string;
    amount?: string;
    erc721Id?: string;
  }) {
    const { tokenInfo } = getState().daoToken;
    if (!daoInstance || !tokenInfo || !address) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const receipt = tokenInfo.isErc721 && erc721Id
      ? await daoVaultInstance.withdrawNFT(tokenInfo.address, erc721Id, { from: address })
      : await daoVaultInstance.withdraw(
        tokenInfo.address,
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

    loadWalletBalance: useCallback(loadWalletBalance, []),
    loadChainBalance: useCallback(loadChainBalance, []),
    loadVaultBalance: useCallback(loadVaultBalance, []),
    loadAllBalances: useCallback(loadAllBalances, []),
    depositToVault: useCallback(depositToVault, []),
    withdrawFromVault: useCallback(withdrawFromVault, []),
    loadVaultNftsList: useCallback(loadVaultNftsList, []),
    loadWithdrawalAmount: useCallback(loadWithdrawalAmount, []),
  };
}
