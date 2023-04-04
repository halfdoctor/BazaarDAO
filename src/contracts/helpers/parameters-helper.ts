import { filterParameter, getParametersValue, ParameterType } from '@q-dev/gdk-sdk';
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
    const panelParameters = await panelParametersInstance.instance.methods.getDAOParameters().call();

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

    const { methods } = daoInstance.DAORegistryInstance.instance;
    const panels = await methods.getPanels().call();

    const contractKeyToMethodMap = {
      'Permission Manager': methods.getPermissionManager(),
      'Voting Factory': methods.getVotingFactory(),
      'Voting Registry': methods.getVotingRegistry(),
      'DAO Vault': methods.getDAOVault(),
      ...panels.reduce((acc, panel) => ({
        ...acc,
        [`${panel} Voting`]: methods.getDAOVoting(panel),
        [`${panel} Parameter Storage`]: methods.getDAOParameterStorage(panel),
        [`${panel} Member Storage`]: methods.getDAOMemberStorage(panel),
      }), {}),
    };

    const contractValues: ParameterValue[] = await Promise.all(
      Object.entries(contractKeyToMethodMap)
        .map(([name, method]) => method.call()
          .then((value) => ({
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
