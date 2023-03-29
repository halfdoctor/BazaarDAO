import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_MAIN_PANEL_NAME } from '@q-dev/gdk-sdk';
import axios from 'axios';

import useNetworkConfig from 'hooks/useNetworkConfig';

import { setHash, setLastUpdate } from './reducer';

import { getState, useAppSelector } from 'store';

import { getDaoInstance } from 'contracts/contract-instance';

import { CONSTITUTION_HASH_PARAMETER_KEY } from 'constants/constitution';
import { captureError } from 'utils/errors';

export function useConstitution () {
  const { constitutionUrl } = useNetworkConfig();
  const dispatch = useDispatch();

  const constitutionHash = useAppSelector(({ constitution }) => constitution.hash);
  const constitutionLastUpdate = useAppSelector(({ constitution }) => constitution.lastUpdate);

  async function loadConstitutionHash () {
    try {
      const { daoAddress } = getState().dao;
      const daoInstance = getDaoInstance(daoAddress);

      const parameterStorageInstance = await daoInstance.getParameterStorageInstance(DAO_MAIN_PANEL_NAME);
      const [, hash] = await parameterStorageInstance.instance.methods
        .getDAOParameter(CONSTITUTION_HASH_PARAMETER_KEY).call();
      dispatch(setHash(hash));
    } catch (error) {
      captureError(error);
    }
  }

  async function loadConstitutionLastUpdate () {
    try {
      const { hash: currentHash } = getState().constitution;

      const constitutionCaller = axios.create({ baseURL: constitutionUrl });
      const response = await constitutionCaller.get('/constitution/list');

      const constitution = response.data
        .find(({ hash }: { hash: string }) => currentHash === `0x${hash}`);
      dispatch(setLastUpdate(constitution.time * 1000));
    } catch (error) {
      captureError(error);
    }
  }

  return {
    constitutionHash,
    constitutionLastUpdate,
    loadConstitutionHash: useCallback(loadConstitutionHash, []),
    loadConstitutionLastUpdate: useCallback(loadConstitutionLastUpdate, []),
  };
}
