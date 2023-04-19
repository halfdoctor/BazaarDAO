import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_RESERVED_NAME, ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { isAddress } from 'helpers';
import { approveErc20, getAllowanceErc20, getErc20ContractInstance, getErc20ContractSigner, loadDetailsErc20 } from 'helpers/erc-20';
import { getErc165ContractInstance, getIsSupportedInterface } from 'helpers/erc-165';
import { getErc721ContractInstance, getErc721ContractSigner, getIsApprovedForAllErc721, loadDetailsErc721, setApprovalForAllErc721 } from 'helpers/erc-721';

import { setDaoAddress, setTokenInfo, setVotingToken, TokenInfo } from './reducer';

import { getState, useAppSelector } from 'store';

import { daoInstance, getDaoInstance } from 'contracts/contract-instance';

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
  owner: ''
};
export const EMPTY_TOKEN_INFO: TokenInfo = {
  name: '',
  symbol: '',
  address: '',
  decimals: 0,
  isNative: true,
  isErc721: false,
  allowance: '0',
  totalSupply: '0',
  totalSupplyCap: '0',
  owner: '',
};

export function useDaoStore () {
  const dispatch = useDispatch();
  const { currentProvider } = useWeb3Context();

  const daoAddress = useAppSelector(({ dao }) => dao.daoAddress);
  const votingToken = useAppSelector(({ dao }) => dao.votingToken);
  const tokenInfo = useAppSelector(({ dao }) => dao.tokenInfo);

  function setNewDaoAddress (address?: string) {
    try {
      const daoAddress = address || window.location.pathname.split('/')[1] || '';
      dispatch(setDaoAddress(isAddress(daoAddress) ? daoAddress : ''));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadDaoVotingToken () {
    try {
      const { daoAddress } = getState().dao;
      if (!daoAddress || !currentProvider?.currentProvider) return;
      const daoInstance = currentProvider.selectedProvider === PROVIDERS.default || !currentProvider?.currentSigner
        ? getDaoInstance(daoAddress, currentProvider.currentProvider)
        : getDaoInstance(daoAddress, currentProvider.currentSigner);
      const votingToken = await daoInstance.getPanelVotingTokenAddress(DAO_RESERVED_NAME);
      dispatch(setVotingToken(votingToken));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadAllDaoInfo (daoAddress?: string) {
    try {
      setNewDaoAddress(daoAddress);
      await loadDaoVotingToken();
      await getTokenInfo();
    } catch (error) {
      captureError(error);
    }
  }

  async function supportsInterface () {
    try {
      const { votingToken } = getState().dao;
      if (!votingToken || !currentProvider.currentProvider) return;
      getErc165ContractInstance(votingToken, currentProvider.currentProvider);
      const isTest = await getIsSupportedInterface(ERC_721_INTERFACE_ID);
      return isTest;
    } catch (_) {
      return false;
    }
  };

  async function getTokenInfo () {
    try {
      const { votingToken } = getState().dao;
      if (!votingToken) return;
      const isNativeToken = votingToken === ETHEREUM_ADDRESS;
      const isErc721 = await supportsInterface();
      const tokenInfo = isNativeToken
        ? Q_TOKEN_INFO
        : isErc721
          ? await getErc721Info(votingToken)
          : await getErc20Info(votingToken);
      dispatch(setTokenInfo(tokenInfo || EMPTY_TOKEN_INFO));
    } catch (error) {
      captureError(error);
    }
  }

  async function getErc20Info (tokenAddress: string) {
    if (!daoInstance || !currentProvider?.currentProvider) return;
    getErc20ContractInstance(tokenAddress, currentProvider.currentProvider);
    if (currentProvider?.currentSigner) {
      getErc20ContractSigner(tokenAddress, currentProvider.currentSigner);
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
    };
  }

  async function getErc721Info (tokenAddress: string) {
    if (!daoInstance || !currentProvider?.currentProvider) return;
    getErc721ContractInstance(tokenAddress, currentProvider.currentProvider);
    if (currentProvider?.currentSigner) {
      getErc721ContractSigner(tokenAddress, currentProvider.currentSigner);
    }
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const details = await loadDetailsErc721(currentProvider);
    const isApprovedForAll = await getIsApprovedForAllErc721(daoVaultInstance.address, currentProvider.selectedAddress);
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
    };
  }

  async function approveToken () {
    const { votingToken, tokenInfo } = getState().dao;
    if (!votingToken || !daoInstance) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    return tokenInfo.isErc721
      ? setApprovalForAllErc721(daoVaultInstance.address, true)
      : approveErc20(daoVaultInstance.address, MAX_APPROVE_AMOUNT, currentProvider.selectedAddress);
  }

  return {
    daoAddress,
    votingToken,
    tokenInfo,

    loadDaoVotingToken: useCallback(loadDaoVotingToken, [currentProvider, daoInstance]),
    loadAllDaoInfo: useCallback(loadAllDaoInfo, [currentProvider, daoInstance]),
    approveToken: useCallback(approveToken, [currentProvider, daoInstance]),
  };
}
