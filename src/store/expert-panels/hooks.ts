import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DAO_RESERVED_NAME } from '@q-dev/gdk-sdk';

import { setAllPanels, setExpertPanels } from './reducer';

import { useAppSelector } from 'store';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export function useExpertPanels () {
  const dispatch = useDispatch();
  const expertPanels: string[] = useAppSelector(({ expertPanels }) => expertPanels.expertPanels);
  const allPanels: string[] = useAppSelector(({ expertPanels }) => expertPanels.allPanels);

  async function loadExpertPanels () {
    try {
      if (!daoInstance) return;
      const expertPanels = await daoInstance.DAORegistryInstance.instance.getPanels();

      dispatch(setExpertPanels(expertPanels));
      dispatch(setAllPanels([DAO_RESERVED_NAME, ...expertPanels]));
    } catch (error) {
      captureError(error);
    }
  }

  async function getPanelMembers (panelName: string) {
    try {
      if (!daoInstance || panelName === DAO_RESERVED_NAME) return [];
      const memberStorageInstance = await daoInstance.getMemberStorageInstance(panelName);
      return memberStorageInstance.instance.getMembers();
    } catch (error) {
      captureError(error);
      return [];
    }
  }

  return {
    expertPanels,
    allPanels,

    loadExpertPanels: useCallback(loadExpertPanels, []),
    getPanelMembers: useCallback(getPanelMembers, []),
  };
}
