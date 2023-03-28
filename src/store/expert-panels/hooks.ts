import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { setPanels } from './reducer';

import { getState, useAppSelector } from 'store';

import { getDaoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export function useExpertPanels () {
  const dispatch = useDispatch();
  const panels = useAppSelector(({ expertPanels }) => expertPanels.panels);

  async function loadExpertPanels () {
    try {
      const { daoAddress } = getState().dao;
      if (!daoAddress) return;
      const daoInstance = getDaoInstance(daoAddress);
      const expertPanels = await daoInstance.DAORegistryInstance.instance.methods.getPanels().call();
      dispatch(setPanels(expertPanels));
    } catch (error) {
      captureError(error);
    }
  }

  return {
    panels,
    loadExpertPanels: useCallback(loadExpertPanels, [])
  };
}
