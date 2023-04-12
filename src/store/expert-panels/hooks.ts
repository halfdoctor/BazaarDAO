import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setPanels } from './reducer';

import { getUserAddress, useAppSelector } from 'store';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export function useExpertPanels () {
  const dispatch = useDispatch();
  const panels = useAppSelector(({ expertPanels }) => expertPanels.panels);

  async function loadExpertPanels () {
    try {
      if (!daoInstance) return;
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

  async function checkIsUserMember (panelName: string) {
    try {
      if (!daoInstance) return false;
      const memberStorageInstance = await daoInstance.getMemberStorageInstance(panelName);
      return memberStorageInstance.instance.methods.isMember(getUserAddress()).call();
    } catch (error) {
      captureError(error);
      return false;
    }
  }

  return {
    panels,
    loadExpertPanels: useCallback(loadExpertPanels, []),
    getPanelMembers: useCallback(getPanelMembers, []),
    checkIsUserMember: useCallback(checkIsUserMember, [])
  };
}
