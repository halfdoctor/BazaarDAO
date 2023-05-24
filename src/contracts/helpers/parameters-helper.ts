import { DAO_RESERVED_NAME, filterParameter, getParametersValue, ParameterType } from '@q-dev/gdk-sdk';
import { ErrorHandler } from 'helpers';
import { ParameterKey } from 'typings/forms';
import { ParameterValue } from 'typings/parameters';

import { daoInstance } from 'contracts/contract-instance';

export async function getPanelParameters (
  panelName: string,
  situation?: string,
) {
  try {
    if (!daoInstance) return [];
    if (panelName === DAO_RESERVED_NAME || !situation) {
      return await daoInstance?.getAggregatedParameters(panelName);
    }
    const confParameterStorage = situation === 'configuration'
      ? await daoInstance.getConfParameterStorageInstance(panelName)
      : await daoInstance.getRegParameterStorageInstance(panelName);
    return await confParameterStorage.instance.getDAOParameters();
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error);
    return [];
  }
}

export async function getParameters (
  panelName: string,
  situation?: string,
  parameterType?: ParameterType
): Promise<ParameterValue[]> {
  try {
    const panelParameters = await getPanelParameters(panelName, situation);
    const filteredParameters = parameterType
      ? filterParameter(panelParameters, parameterType)
      : panelParameters;
    const parametersNormalValue = getParametersValue(filteredParameters);
    return filteredParameters.map((item: ParameterKey, index: number) => {
      return { ...item, normalValue: parametersNormalValue[index] };
    });
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error);
    return [];
  }
}

export async function getRegistryContracts (): Promise<ParameterValue[]> {
  try {
    if (!daoInstance) return [];

    const { instance } = daoInstance.DAORegistryInstance;
    const panels = await instance.getPanels();

    const contractKeyToMethodMap = {
      'Permission Manager': instance.getPermissionManager(),
      'Voting Factory': instance.getVotingFactory(),
      'Voting Registry': instance.getVotingRegistry(),
      'DAO Vault': instance.getDAOVault(),
      ...panels.reduce((acc, panel) => ({
        ...acc,
        [`${panel} Voting`]: panel === DAO_RESERVED_NAME ? instance.getGeneralDAOVoting(DAO_RESERVED_NAME) : instance.getExpertsDAOVoting(panel),
        [`${panel} Regular Parameter Storage`]: instance.getRegDAOParameterStorage(panel),
        [`${panel} Configuration Parameter Storage`]: instance.getConfDAOParameterStorage(panel),
        [`${panel} Member Storage`]: panel === DAO_RESERVED_NAME ? undefined : instance.getDAOMemberStorage(panel),
      }), {}),
    };

    const contractValues: ParameterValue[] = await Promise.all(
      Object.entries(contractKeyToMethodMap)
        .map(([name, method]) => method
          ?.then((value) => ({
            name,
            value,
            normalValue: value,
            solidityType: ParameterType.ADDRESS,
          }))
        )
    );

    return contractValues;
  } catch (error) {
    ErrorHandler.processWithoutFeedback(error);
    return [];
  }
}
