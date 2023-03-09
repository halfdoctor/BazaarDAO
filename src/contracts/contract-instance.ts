import { ContractRegistryInstance } from '@q-dev/q-js-sdk';
import { ContractType, ContractValue } from 'typings/contracts';

export const CONTRACT_REGISTRY_ADDRESS = '0xc3E589056Ece16BCB88c6f9318e9a7343b663522';
export let contractRegistryInstance: ContractRegistryInstance | null = null;
const cache: Record<string, ContractValue> = {};

export const getContractRegistryInstance = () => {
  if (!contractRegistryInstance) {
    contractRegistryInstance = new ContractRegistryInstance(window.web3, CONTRACT_REGISTRY_ADDRESS);
  }
  return contractRegistryInstance;
};

export function getInstance<T extends ContractType> (
  instance: T,
  asset?: string
): () => ContractValue<T> {
  return () => {
    if (!cache[instance]) {
      const contractRegistryInstance = getContractRegistryInstance();
      cache[instance] = contractRegistryInstance[instance](asset || '');
    }

    return cache[instance];
  };
}

export const getGeneralUpdateVotingInstance = getInstance('generalUpdateVoting');

export const getEmergencyUpdateVotingInstance = getInstance('emergencyUpdateVoting');
export const getVotingWeightProxyInstance = getInstance('votingWeightProxy');

export const getConstitutionVotingInstance = getInstance('constitutionVoting');
export const getConstitutionInstance = getInstance('constitution');

export const getQVaultInstance = getInstance('qVault');

export const getEpqfiMembershipVotingInstance = getInstance('epqfiMembershipVoting');
export const getEpqfiMembershipInstance = getInstance('epqfiMembership');
export const getEpqfiParametersVotingInstance = getInstance('epqfiParametersVoting');
export const getEpqfiParametersInstance = getInstance('epqfiParameters');

export const getEpdrParametersVotingInstance = getInstance('epdrParametersVoting');
export const getEpdrParametersInstance = getInstance('epdrParameters');
export const getEpdrMembershipVotingInstance = getInstance('epdrMembershipVoting');
export const getEpdrMembershipInstance = getInstance('epdrMembership');

export const getEprsParametersInstance = getInstance('eprsParameters');
export const getEprsMembershipInstance = getInstance('eprsMembership');
export const getEprsMembershipVotingInstance = getInstance('eprsMembershipVoting');
export const getEprsParametersVotingInstance = getInstance('eprsParametersVoting');
