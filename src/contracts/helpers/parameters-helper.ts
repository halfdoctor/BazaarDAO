import { DAO_RESERVED_NAME, filterParameter, getParametersValue, ParameterType } from '@q-dev/gdk-sdk';
import { ParameterKey } from 'typings/forms';
import { ParameterValue } from 'typings/parameters';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export async function getParameters (
  panelName: string,
  parameterType?: ParameterType
): Promise<ParameterValue[]> {
  try {
    if (!daoInstance) return [];

    const panelParametersInstance = await daoInstance?.getParameterStorageInstance(panelName);
    const panelParameters = await panelParametersInstance.instance.getDAOParameters();

    const filteredParameters = parameterType
      ? filterParameter(panelParameters, parameterType)
      : panelParameters;
    const parametersNormalValue = getParametersValue(filteredParameters);

    return filteredParameters.map((item: ParameterKey, index: number) => {
      return { ...item, normalValue: parametersNormalValue[index] };
    });
  } catch (error) {
    captureError(error);
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
        [`${panel} Voting`]: panel === DAO_RESERVED_NAME ? instance.getGeneralDAOVoting(panel) : instance.getExpertsDAOVoting(panel),
        [`${panel} Parameter Storage`]: instance.getDAOParameterStorage(panel),
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
    captureError(error);
    return [];
  }
}
