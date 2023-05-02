import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_RESERVED_NAME, ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { approveErc20, getAllowanceErc20, getErc20ContractInstance, getErc20ContractSigner, loadDetailsErc20 } from 'helpers/erc-20';
import { getErc165ContractInstance, getIsSupportedInterface } from 'helpers/erc-165';
import { getErc721ContractInstance, getErc721ContractSigner, getIsApprovedForAllErc721, loadDetailsErc721, setApprovalForAllErc721 } from 'helpers/erc-721';

import { setTokenInfo, setVotingToken, TokenInfo } from './reducer';

import { getState, useAppSelector } from 'store';

import { daoInstance, getDaoInstance, resetDaoInstance } from 'contracts/contract-instance';

import { ERC_721_INTERFACE_ID, MAX_APPROVE_AMOUNT } from 'constants/boundaries';
import { PROVIDERS } from 'constants/providers';
import { captureError } from 'utils/errors';

export const Q_TOKEN_INFO: TokenInfo = {
  name: 'Q',
  symbol: 'Q',
  decimals: 18,
  isNative: true,
  allowance: '',
  address: ETHEREUM_ADDRESS,
  totalSupply: '1000000000',
  totalSupplyCap: '1000000000',
  owner: '',
  formatNumber: 4
};

export function useDaoTokenStore () {
  const dispatch = useDispatch();

  const votingToken: string = useAppSelector(({ daoToken }) => daoToken.votingToken);
  const tokenInfo: TokenInfo | null = useAppSelector(({ daoToken }) => daoToken.tokenInfo);

  async function loadDaoVotingToken () { // TODO: refactoring
    try {
      const { daoAddress } = getState().dao;
      const { currentProvider } = getState().provider;

      if (!daoAddress || !currentProvider?.provider) {
        resetDaoInstance();
        dispatch(setVotingToken(''));
        return;
      };

      const providerOrSigner = currentProvider.selectedProvider === PROVIDERS.default || !currentProvider?.signer
        ? currentProvider.provider
        : currentProvider.signer;
      const daoInstance = getDaoInstance(daoAddress, providerOrSigner);
      if (!daoInstance) return;

      const votingToken = await daoInstance.getPanelVotingTokenAddress(DAO_RESERVED_NAME);
      dispatch(setVotingToken(votingToken));
    } catch (error) {
      captureError(error);
    }
  }

  async function getTokenInfo () { //  TODO: refactoring
    try {
      const { votingToken } = getState().daoToken;
      const isErc721 = await supportsInterface();
      const tokenInfo = votingToken === ETHEREUM_ADDRESS
        ? Q_TOKEN_INFO
        : isErc721
          ? await getErc721Info(votingToken)
          : await getErc20Info(votingToken);
      dispatch(setTokenInfo(tokenInfo || null));
    } catch (error) {
      captureError(error);
    }
  }

  async function getErc20Info (tokenAddress: string) { // TODO: refactoring
    try {
      const { currentProvider } = getState().provider;
      if (!daoInstance || !currentProvider?.provider) return;

      getErc20ContractInstance(tokenAddress, currentProvider.provider);

      if (currentProvider?.signer) {
        getErc20ContractSigner(tokenAddress, currentProvider.signer);
      }
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const details = await loadDetailsErc20(currentProvider);
      const allowance = await getAllowanceErc20(currentProvider.selectedAddress, daoVaultInstance.address);
      if (!details) return;
      const { decimals, name, symbol, totalSupply, owner, totalSupplyCap } = details;

      return {
        decimals,
        name,
        symbol,
        totalSupply,
        totalSupplyCap,
        owner,
        isNative: false,
        allowance: allowance,
        address: tokenAddress,
        formatNumber: 4
      };
    } catch (error) {
      captureError(error);
    }
  }

  async function getErc721Info (tokenAddress: string) {
    try {
      const { currentProvider } = getState().provider;
      if (!daoInstance || !currentProvider?.provider) return;

      getErc721ContractInstance(tokenAddress, currentProvider.provider);
      if (currentProvider?.signer) {
        getErc721ContractSigner(tokenAddress, currentProvider.signer);
      }
      const daoVaultInstance = await daoInstance.getVaultInstance();
      const details = await loadDetailsErc721(currentProvider);
      const isApprovedForAll = await getIsApprovedForAllErc721(
        daoVaultInstance.address, currentProvider.selectedAddress
      );
      if (!details) return;
      const { name, symbol, totalSupply, owner, totalSupplyCap } = details;

      return {
        decimals: 0,
        name,
        symbol,
        totalSupply,
        totalSupplyCap,
        owner,
        isNative: false,
        isErc721: true,
        isErc721Approved: isApprovedForAll,
        address: tokenAddress,
        allowance: '',
        formatNumber: 0
      };
    } catch (error) {
      captureError(error);
    }
  }

  async function supportsInterface () {
    try {
      const { votingToken } = getState().daoToken;
      const { currentProvider } = getState().provider;
      if (!votingToken || !currentProvider?.provider) return false;
      getErc165ContractInstance(votingToken, currentProvider.provider);
      const isErc721Token = await getIsSupportedInterface(ERC_721_INTERFACE_ID);
      return isErc721Token;
    } catch (error) {
      captureError(error);
      return false;
    }
  };

  async function approveToken () {
    const { tokenInfo } = getState().daoToken;
    const { currentProvider } = getState().provider;
    if (!tokenInfo || !daoInstance || !currentProvider) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    return tokenInfo.isErc721
      ? setApprovalForAllErc721(daoVaultInstance.address, true)
      : approveErc20(daoVaultInstance.address, MAX_APPROVE_AMOUNT, currentProvider.selectedAddress);
  }

  return {
    votingToken,
    tokenInfo,

    loadDaoVotingToken: useCallback(loadDaoVotingToken, []),
    getTokenInfo: useCallback(getTokenInfo, []),
    getErc20Info: useCallback(getErc20Info, []),
    getErc721Info: useCallback(getErc721Info, []),
    approveToken: useCallback(approveToken, []),
  };
}
