import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_RESERVED_NAME } from '@q-dev/gdk-sdk';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { ErrorHandler } from 'helpers';
import { SupportedDaoNetwork } from 'typings/dao';

import { setCanDAOSupportExternalLinks, setDaoAddress, setDAOName, setSupportedNetworks } from './reducer';

import { getState, useAppSelector } from 'store';
import { useDaoTokenStore } from 'store/dao-token/hooks';

import { daoInstance } from 'contracts/contract-instance';
import { getParameters } from 'contracts/helpers/parameters-helper';

export function useDaoStore () {
  const dispatch = useDispatch();
  const { chainId } = useWeb3Context();
  const { loadDaoVotingToken, getToken, loadDaoInstance } = useDaoTokenStore();

  const daoAddress = useAppSelector(({ dao }) => dao.daoAddress);
  const daoName = useAppSelector(({ dao }) => dao.daoName);
  const isDaoAddressExist = useAppSelector(({ dao }) => Boolean(dao.daoAddress));
  const isDaoSupportingToken = useAppSelector(({ dao, daoToken }) =>
    Boolean(dao.daoAddress && daoToken.tokenInfo));
  const canDAOSupportSituationExternalLinks = useAppSelector(({ dao }) =>
    dao.canDAOSupportExternalLinks
  );

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

  async function loadDAOName () {
    try {
      const params = await getParameters(DAO_RESERVED_NAME);
      const name = params.find(({ name }) => name === 'constitution.daoName')?.normalValue || '';
      dispatch(setDAOName(name));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function loadCanDAOSupportExternalLinks () {
    try {
      if (!daoInstance) return;

      const isSupportExternalLink = await daoInstance.doesDaoSupportExternalLinks();
      dispatch(setCanDAOSupportExternalLinks(isSupportExternalLink));
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  }

  async function loadAllDaoInfo () {
    try {
      await loadDaoInstance();
      await loadDaoVotingToken();
      await Promise.all([
        getToken(),
        loadCanDAOSupportExternalLinks(),
        loadDAOName()
      ]);
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
    daoName,
    supportedNetworks,
    isDaoAddressExist,
    isDaoOnSupportedNetwork,
    isDaoSupportingToken,
    isSelectPage,
    isShowDao,
    canDAOSupportSituationExternalLinks,

    composeDaoLink,
    setSupportedNetworks: useCallback(setDaoSupportedNetworks, []),
    setDaoAddress: useCallback(setNewDaoAddress, []),
    loadAllDaoInfo: useCallback(loadAllDaoInfo, []),
  };
}
