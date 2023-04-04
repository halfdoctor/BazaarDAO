import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_MAIN_PANEL_NAME, ETHEREUM_ADDRESS } from '@q-dev/gdk-sdk';
import { Contract } from 'web3-eth-contract';

import { setDaoAddress, setTokenInfo, setVotingToken, TokenInfo } from './reducer';

import { getState, getUserAddress, useAppSelector } from 'store';

import { daoInstance, getDaoInstance, getErc20Contract } from 'contracts/contract-instance';

import { MAX_APPROVE_AMOUNT } from 'constants/boundaries';
import { captureError } from 'utils/errors';
import { isAddress } from 'utils/web3';

const Q_TOKEN_INFO: TokenInfo = {
  name: 'Q',
  symbol: 'Q',
  decimals: 18,
  isNative: true,
  allowance: '',
  address: ETHEREUM_ADDRESS
};

export function useDaoStore () {
  const dispatch = useDispatch();
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
      if (!daoAddress) return;
      const daoInstance = getDaoInstance(daoAddress);
      const votingToken = await daoInstance.getPanelVotingTokenAddress(DAO_MAIN_PANEL_NAME);
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

  async function getTokenInfo () {
    try {
      const { votingToken } = getState().dao;
      if (!votingToken) return;
      const isNativeToken = votingToken === ETHEREUM_ADDRESS;
      const tokenInfo = isNativeToken
        ? Q_TOKEN_INFO
        : await getErc20Info(votingToken);
      dispatch(setTokenInfo({ ...tokenInfo, address: votingToken }));
    } catch (error) {
      captureError(error);
    }
  }

  async function getErc20Info (tokenAddress: string) {
    const tokenContract = getErc20Contract(tokenAddress);
    const [symbol, decimals, name, allowance] = await Promise.all([
      tokenContract.methods.symbol().call(),
      tokenContract.methods.decimals().call(),
      tokenContract.methods.name().call(),
      getAllowance(tokenContract),
    ]);
    return { decimals, name, symbol, isNative: false, allowance } as TokenInfo;
  }

  async function getAllowance (tokenContract: Contract) {
    if (!daoInstance) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    return tokenContract.methods.allowance(getUserAddress(), daoVaultInstance.address).call();
  }

  async function approveToken () {
    const { votingToken } = getState().dao;
    if (!votingToken || !daoInstance) return;
    const daoVaultInstance = await daoInstance.getVaultInstance();
    const tokenContract = getErc20Contract(votingToken);
    return tokenContract.methods.approve(daoVaultInstance.address, MAX_APPROVE_AMOUNT).send({
      from: getUserAddress()
    });
  }

  return {
    daoAddress,
    votingToken,
    tokenInfo,

    setDaoAddress: useCallback(setNewDaoAddress, []),
    loadDaoVotingToken: useCallback(loadDaoVotingToken, []),
    loadAllDaoInfo: useCallback(loadAllDaoInfo, []),
    approveToken: useCallback(approveToken, []),
  };
}
