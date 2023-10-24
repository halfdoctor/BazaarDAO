import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { useWeb3Context } from 'context/Web3ContextProvider';
import { ErrorHandler } from 'helpers';
import { SupportedDaoNetwork } from 'typings/dao';

import { setDaoAddress, setSupportedNetworks } from './reducer';

import { getState, useAppSelector } from 'store';
import { useDaoTokenStore } from 'store/dao-token/hooks';

export function useDaoStore () {
  const dispatch = useDispatch();
  const { chainId } = useWeb3Context();
  const { loadDaoVotingToken, getToken, loadDaoInstance } = useDaoTokenStore();

  const daoAddress = useAppSelector(({ dao }) => dao.daoAddress);
  const isDaoAddressExist = useAppSelector(({ dao }) => Boolean(dao.daoAddress));
  const isDaoSupportingToken = useAppSelector(({ dao, daoToken }) =>
    Boolean(dao.daoAddress && daoToken.tokenInfo));

  const supportedNetworks: SupportedDaoNetwork[] = useAppSelector(({ dao }) => dao.supportedNetworks);

  const isDaoOnSupportedNetwork = supportedNetworks.some((item: SupportedDaoNetwork) =>
    item.chainId === Number(chainId)) && isDaoAddressExist;

  const isSelectPage = useMemo(() =>
    !isDaoAddressExist || (isDaoOnSupportedNetwork && isDaoSupportingToken),
  [isDaoAddressExist, isDaoOnSupportedNetwork, isDaoSupportingToken]);

  const isShowDao = useMemo(() =>
    !isSelectPage || !isDaoOnSupportedNetwork || !isDaoSupportingToken,
  [isSelectPage, isDaoOnSupportedNetwork, isDaoSupportingToken]);

  function setNewDaoAddress (address: string) {
    dispatch(setDaoAddress(address));
  }

  function setDaoSupportedNetworks (supportedNetworks: SupportedDaoNetwork[]) {
    dispatch(setSupportedNetworks(supportedNetworks));
  }

  async function loadAllDaoInfo () {
    try {
      await loadDaoInstance();
      await loadDaoVotingToken();
      await getToken();
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  function composeDaoLink (path: string) {
    const { daoAddress } = getState().dao;
    return `/${daoAddress}${path}`;
  }

  return {
    daoAddress,
    supportedNetworks,
    isDaoAddressExist,
    isDaoOnSupportedNetwork,
    isDaoSupportingToken,
    isSelectPage,
    isShowDao,

    composeDaoLink,
    setSupportedNetworks: useCallback(setDaoSupportedNetworks, []),
    setDaoAddress: useCallback(setNewDaoAddress, []),
    loadAllDaoInfo: useCallback(loadAllDaoInfo, []),
  };
}
