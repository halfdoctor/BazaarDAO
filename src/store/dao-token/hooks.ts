import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_RESERVED_NAME, ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { errors } from 'errors';
import { ErrorHandler, getErc5484ContractInstance, getErc5484ContractSigner, loadErc5484Details } from 'helpers';
import { approveErc20, getAllowanceErc20, getErc20ContractInstance, getErc20ContractSigner, loadDetailsErc20 } from 'helpers/erc-20';
import { getErc721ContractInstance, getErc721ContractSigner, getIsApprovedForAllErc721, loadDetailsErc721, setApprovalForAllErc721 } from 'helpers/erc-721';

import { setTokenInfo, setVotingToken, TokenInfo, TokenType } from './reducer';

import { getState, useAppSelector } from 'store';

import { daoInstance, getDaoInstance, resetDaoInstance } from 'contracts/contract-instance';

import { MAX_APPROVE_AMOUNT } from 'constants/boundaries';

export const Q_TOKEN_INFO: TokenInfo = {
  name: 'Q',
  symbol: 'Q',
  decimals: 18,
  type: 'native',
  address: ETHEREUM_ADDRESS,
  totalSupply: '',
  totalSupplyCap: '',
  owner: '',
  formatNumber: 4
};

export function useDaoTokenStore () {
  const dispatch = useDispatch();
  const votingToken: string = useAppSelector(({ daoToken }) => daoToken.votingToken);
  const tokenInfo: TokenInfo | null = useAppSelector(({ daoToken }) => daoToken.tokenInfo);
  const { currentProvider, currentSigner, address: accountAddress } = useWeb3Context();

  async function loadDaoInstance () {
    try {
      const { daoAddress } = getState().dao;
      if (!daoAddress || !currentProvider) {
        throw new errors.DefaultEmptyError();
      };

      getDaoInstance(daoAddress, currentSigner || currentProvider);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      resetDaoInstance();
    }
  }

  async function loadDaoVotingToken () {
    try {
      if (!daoInstance) {
        throw new errors.DefaultEmptyError();
      };
      const votingToken = await daoInstance.getPanelVotingTokenAddress(DAO_RESERVED_NAME);
      dispatch(setVotingToken(votingToken));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      dispatch(setVotingToken(''));
    }
  }

  async function getToken () {
    try {
      const tokenInfo = await getTokenInfo();
      dispatch(setTokenInfo(tokenInfo));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function getTokenInfo () {
    try {
      const { votingToken } = getState().daoToken;
      if (!daoInstance || !votingToken) return null;
      const daoVaultInstance = await daoInstance.getVaultInstance();
      if (votingToken === ETHEREUM_ADDRESS) {
        return Q_TOKEN_INFO;
      }
      const isSupportedSBT = await daoVaultInstance.instance.isSupportedSBT(votingToken);
      if (isSupportedSBT) {
        return await getErc5484Info(votingToken);
      }
      const isSupportedNFT = await daoVaultInstance.instance.isSupportedNFT(votingToken);
      if (isSupportedNFT) {
        return await getErc721Info(votingToken);
      }
      return await getErc20Info(votingToken);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return null;
    }
  }

  async function getErc20Info (tokenAddress: string) {
    try {
      if (!daoInstance || !currentProvider) return null;
      getErc20ContractInstance(tokenAddress, currentProvider);
      getErc20ContractSigner(tokenAddress, currentSigner);
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const details = await loadDetailsErc20(accountAddress);
      const allowance = await getAllowanceErc20(accountAddress, daoVaultInstance.address);
      return details
        ? {
          ...details,
          allowance,
          type: 'erc20'as TokenType,
          address: tokenAddress,
          formatNumber: 4
        }
        : null;
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return null;
    }
  }

  async function getErc5484Info (tokenAddress: string) {
    try {
      if (!daoInstance || !currentProvider) return null;
      getErc5484ContractInstance(tokenAddress, currentProvider);
      getErc5484ContractSigner(tokenAddress, currentSigner);
      const details = await loadErc5484Details(accountAddress);
      const isAuthorizedBySBT = await checkIsAuthorizedBySBT(tokenAddress);

      return details
        ? {
          ...details,
          isAuthorizedBySBT,
          type: 'erc5484' as TokenType,
          address: tokenAddress,
          decimals: 0,
          formatNumber: 0
        }
        : null;
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return null;
    }
  }

  async function getErc721Info (tokenAddress: string) {
    try {
      if (!daoInstance || !currentProvider) return null;
      getErc721ContractInstance(tokenAddress, currentProvider);
      getErc721ContractSigner(tokenAddress, currentSigner);
      const details = await loadDetailsErc721(accountAddress);
      if (!details) return null;
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const isErc721Approved = await getIsApprovedForAllErc721(daoVaultInstance.address, accountAddress);
      return {
        ...details,
        isErc721Approved,
        address: tokenAddress,
        type: 'erc721'as TokenType,
        decimals: 0,
        formatNumber: 0
      };
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return null;
    }
  }

  async function approveToken () {
    const { tokenInfo } = getState().daoToken;
    if (!tokenInfo || !daoInstance || !accountAddress) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    return tokenInfo?.type === 'erc721'
      ? setApprovalForAllErc721(daoVaultInstance.address, true)
      : approveErc20(daoVaultInstance.address, MAX_APPROVE_AMOUNT, accountAddress);
  }

  const checkIsAuthorizedBySBT = async (address: string) => {
    if (!address || !daoInstance || !accountAddress) return false;
    try {
      const daoVaultInstance = await daoInstance.getVaultInstance();
      return await daoVaultInstance.instance.isAuthorizedBySBT(
        accountAddress,
        address
      );
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  };

  return {
    votingToken,
    tokenInfo,

    loadDaoInstance: useCallback(loadDaoInstance, []),
    loadDaoVotingToken: useCallback(loadDaoVotingToken, []),
    getToken: useCallback(getToken, []),
    getErc20Info: useCallback(getErc20Info, []),
    getErc721Info: useCallback(getErc721Info, []),
    approveToken: useCallback(approveToken, []),
  };
}
