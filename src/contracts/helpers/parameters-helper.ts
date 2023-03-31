import { filterParameter, ParameterType } from '@q-dev/gdk-sdk';
import { ContractRegistryUpgradeVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/ContractRegistryUpgradeVoting';
import { ContractType } from 'typings/contracts';

import { daoInstance, getInstance } from 'contracts/contract-instance';

import { captureError } from 'utils/errors';

export async function getParameters (
  panelName: string,
  parameterType: ParameterType
) {
  try {
    if (!daoInstance) return;
    const panelParametersInstance = await daoInstance?.getParameterStorageInstance(panelName);
    const panelParameters = await panelParametersInstance.instance.methods.getDAOParameters().call();
    return filterParameter(panelParameters, parameterType);
  } catch (error) {
    captureError(error);
    return [];
  }
}

export async function getContractOwner (type: ContractType) {
  const contract = await getInstance(type)() as ContractRegistryUpgradeVotingInstance;
  return 'owner' in contract.instance.methods
    ? contract.instance.methods.owner().call()
    : '';
}
