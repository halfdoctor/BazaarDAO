import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { fillArray } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { errors } from 'errors';
import { utils } from 'ethers';
import { ErrorHandler, getErc5484BalanceOf } from 'helpers';
import { getBalanceOfErc20 } from 'helpers/erc-20';
import { getBalanceOfErc721, getTokenOfOwnerByIndexErc721 } from 'helpers/erc-721';

import {
  setChainBalance,
  setConstitutionData,
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

import { fromWeiWithDecimals, toWeiWithDecimals } from 'utils/numbers';

export function useDaoVault () {
  const dispatch = useDispatch();
  const { currentProvider, currentSigner, address: accountAddress } = useWeb3Context();

  const vaultBalance: string = useAppSelector(({ qVault }) => qVault.vaultBalance);
  const walletBalance: string = useAppSelector(({ qVault }) => qVault.walletBalance);
  const chainBalance: string = useAppSelector(({ qVault }) => qVault.chainBalance);
  const walletNftsList: string[] = useAppSelector(({ qVault }) => qVault.walletNftsList);
  const lockedBalance: string = useAppSelector(({ qVault }) => qVault.lockedBalance);
  const withdrawalBalance: string = useAppSelector(({ qVault }) => qVault.withdrawalBalance);
  const withdrawalNftsList: string[] = useAppSelector(({ qVault }) => qVault.withdrawalNftsList);
  const vaultTimeLock: string = useAppSelector(({ qVault }) => qVault.vaultTimeLock);
  const isConstitutionSigned: boolean = useAppSelector(({ qVault }) => qVault.constitutionData.isSigned);

  async function loadConstitutionData () {
    try {
      if (!daoInstance || !accountAddress) throw new errors.DefaultEmptyError();
      const vaultInstance = await daoInstance.getVaultInstance();
      const { isSigned, signedAt } = await vaultInstance.getUserConstitutionData(accountAddress);
      dispatch(setConstitutionData({
        isSigned,
        signedAt: signedAt.toString()
      }));
    } catch (e) {
      ErrorHandler.processWithoutFeedback(e);
    }
  }

  async function loadWalletBalance () {
    try {
      const { tokenInfo } = getState().daoToken;
      if (!tokenInfo || !accountAddress) throw new errors.DefaultEmptyError();
      let balance;
      switch (tokenInfo.type) {
        case 'native':
          balance = await currentProvider?.getBalance(accountAddress);
          break;
        case 'erc20':
          balance = await getBalanceOfErc20(accountAddress);
          break;
        case 'erc721':
          balance = await getBalanceOfErc721(accountAddress);
          break;
        case 'erc5484':
          balance = await getErc5484BalanceOf(accountAddress);
          break;
        default:
          throw new Error('Unknown token type');
      }

      dispatch(setWalletBalance(fromWeiWithDecimals(balance?.toString() || '0', tokenInfo.decimals)));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      dispatch(setWalletBalance('0'));
    }
  }
  async function loadChainBalance () {
    try {
      if (!accountAddress || !currentProvider) {
        throw new errors.DefaultEmptyError();
      };
      const balance = await currentProvider.getBalance(accountAddress);
      dispatch(setChainBalance(fromWeiWithDecimals(balance.toString(), Q_TOKEN_INFO.decimals)));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      dispatch(setChainBalance('0'));
    }
  }

  async function loadVaultBalance (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().daoToken;
      if (!daoInstance || !votingToken || !accountAddress || !tokenInfo) {
        throw new errors.DefaultEmptyError();
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const balance = tokenInfo?.type === 'erc721' || tokenInfo?.type === 'erc5484'
        ? await daoVaultInstance.instance.getUserVotingPower(address || accountAddress, votingToken)
        : await daoVaultInstance.instance.userTokenBalance(address || accountAddress, votingToken);
      dispatch(setVaultBalance(fromWeiWithDecimals(balance.toString(), tokenInfo.decimals)));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      dispatch(setVaultBalance('0'));
    }
  }

  async function loadWithdrawalAmount (address?: string) {
    try {
      const { votingToken, tokenInfo } = getState().daoToken;
      if (!daoInstance || !votingToken || !tokenInfo || !accountAddress) {
        throw new errors.DefaultEmptyError();
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();

      const balance = await daoVaultInstance
        .getTimeLockInfo(address || accountAddress, votingToken);

      dispatch(setWithdrawalBalance((fromWeiWithDecimals(balance.withdrawalAmount.toString(), tokenInfo.decimals))));
      dispatch(setLockedBalance(tokenInfo?.type === 'erc721' && Number(balance.unlockTime)
        ? '1'
        : fromWeiWithDecimals(balance.lockedAmount.toString(), tokenInfo.decimals)));
      dispatch(setVaultTimeLock(balance.unlockTime.toString()));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      dispatch(setWithdrawalBalance('0'));
      dispatch(setLockedBalance('0'));
      dispatch(setVaultTimeLock('0'));
    }
  }

  async function loadVaultNftsList (address?: string) {
    try {
      const { tokenInfo } = getState().daoToken;
      if (!daoInstance || !tokenInfo || tokenInfo?.type !== 'erc721' || !accountAddress) {
        throw new errors.DefaultEmptyError();
      };
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const withdrawalNftsList = await daoVaultInstance.instance
        .getUserNFTs(address || accountAddress, tokenInfo.address);
      dispatch(setWithdrawalNftsList(withdrawalNftsList.map(item => item.toString())));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      dispatch(setWithdrawalNftsList([]));
    }
  }

  async function loadWalletNftsList (address?: string) {
    try {
      const { tokenInfo } = getState().daoToken;
      const { walletBalance } = getState().qVault;
      const searchAddress = address || accountAddress;
      if (tokenInfo?.type !== 'erc721' || !searchAddress) {
        throw new errors.DefaultEmptyError();
      };
      const walletNftsList = await Promise.all(fillArray(Number(walletBalance))
        .map(item => getTokenOfOwnerByIndexErc721(searchAddress, item)));
      dispatch(setWalletNftsList(walletNftsList.filter(item => item)));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
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
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function signConstitution () {
    if (!daoInstance || !currentSigner || !accountAddress) return;

    const constitutionHash = await daoInstance.getConstitutionHash();
    const bytes = utils.arrayify(constitutionHash);
    const signedHash = await currentSigner.signMessage(bytes);

    const daoVaultInstance = await daoInstance.getVaultInstance();
    return daoVaultInstance.signConstitution(accountAddress, signedHash);
  }

  async function depositToVault ({ amount, erc721Id }: {
    amount: string;
    erc721Id: string; }) {
    const { tokenInfo } = getState().daoToken;
    if (!daoInstance || !tokenInfo || !accountAddress) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();

    switch (tokenInfo.type) {
      case 'native':
        return daoVaultInstance.depositNative(
          {
            from: accountAddress,
            value: toWeiWithDecimals(amount, tokenInfo.decimals)
          }
        );
      case 'erc20':
        return daoVaultInstance.depositERC20(
          tokenInfo.address,
          toWeiWithDecimals(amount, tokenInfo.decimals),
          { from: accountAddress }
        );
      case 'erc721':
        return daoVaultInstance.depositNFT(tokenInfo.address, erc721Id, { from: accountAddress });
      case 'erc5484':
        return daoVaultInstance.authorizeBySBT(tokenInfo.address, { from: accountAddress });
      default:
        throw new Error('Unknown token type');
    }
  }

  async function withdrawFromVault ({ amount, erc721Id }: {
    amount: string;
    erc721Id: string;
  }) {
    const { tokenInfo } = getState().daoToken;
    if (!daoInstance || !tokenInfo || !accountAddress) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    switch (tokenInfo.type) {
      case 'native':
        return daoVaultInstance.withdrawNative(
          toWeiWithDecimals(amount, tokenInfo.decimals),
          {
            from: accountAddress,
            value: toWeiWithDecimals(amount, tokenInfo.decimals)
          }
        );
      case 'erc20':
        return daoVaultInstance.withdrawERC20(
          tokenInfo.address,
          toWeiWithDecimals(amount, tokenInfo.decimals),
          { from: accountAddress }
        );
      case 'erc721':
        return daoVaultInstance.withdrawNFT(tokenInfo.address, erc721Id, { from: accountAddress });
      case 'erc5484':
        return daoVaultInstance.revokeSBTAuthorization(tokenInfo.address, { from: accountAddress });
      default:
        throw new Error('Unknown token type');
    }
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
    isConstitutionSigned,

    signConstitution: useCallback(signConstitution, []),
    loadConstitutionData: useCallback(loadConstitutionData, []),
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
