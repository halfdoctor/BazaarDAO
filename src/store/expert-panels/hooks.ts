import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setPanels } from './reducer';

import { useAppSelector } from 'store';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export function useExpertPanels () {
  const dispatch = useDispatch();
  const panels = useAppSelector(({ expertPanels }) => expertPanels.panels);

  async function loadExpertPanels () {
    try {
      if (!daoInstance) return [];
      const expertPanels = await daoInstance.DAORegistryInstance.instance.methods.getPanels().call();
      dispatch(setPanels(expertPanels));
    } catch (error) {
      captureError(error);
    }
  }

  async function getPanelMembers (panelName: string) {
    try {
      if (!daoInstance) return [];

      const memberStorageInstance = await daoInstance.getMemberStorageInstance(panelName);
      return memberStorageInstance.instance.methods.getMembers().call();
    } catch (error) {
      captureError(error);
      return [];
    }
  }

  return {
    panels,
    loadExpertPanels: useCallback(loadExpertPanels, []),
    getPanelMembers: useCallback(getPanelMembers, [])
  };
}
