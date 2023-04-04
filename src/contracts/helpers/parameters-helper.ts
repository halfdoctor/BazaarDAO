import { filterParameter, getParametersValue, ParameterType } from '@q-dev/gdk-sdk';
import { ParameterKey } from 'typings/forms';

import { daoInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export async function getParameters (
  panelName: string,
  parameterType: ParameterType
) {
  try {
    if (!daoInstance) return;
    const panelParametersInstance = await daoInstance?.getParameterStorageInstance(panelName);
    const panelParameters = await panelParametersInstance.instance.methods.getDAOParameters().call();
    const filteredParameters = filterParameter(panelParameters, parameterType);
    const parametersNormalValue = getParametersValue(filteredParameters);

    return filteredParameters.map((item: ParameterKey, index: number) => {
      return { ...item, normalValue: parametersNormalValue[index] };
    });
  } catch (error) {
    captureError(error);
    return [];
  }
}
