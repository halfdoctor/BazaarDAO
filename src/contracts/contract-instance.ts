import { MasterDAORegistryInstance, PermissionManagerInstance } from '@q-dev/gdk-sdk';
import ERC20 from '@q-dev/gdk-sdk/lib/abi/ERC20Upgradeable.json';
import { DAOInstance } from '@q-dev/gdk-sdk/lib/contracts/DAOInstance';
import { ContractRegistryInstance } from '@q-dev/q-js-sdk';
import { ContractType, ContractValue } from 'typings/contracts';
import { AbiItem } from 'web3-utils';

export const CONTRACT_REGISTRY_ADDRESS = '0xc3E589056Ece16BCB88c6f9318e9a7343b663522';
export let contractRegistryInstance: ContractRegistryInstance | null = null;
export let daoInstance: DAOInstance | null = null;
const cache: Record<string, ContractValue> = {};

export const getContractRegistryInstance = () => {
  if (!contractRegistryInstance) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    contractRegistryInstance = new ContractRegistryInstance(window.web3, CONTRACT_REGISTRY_ADDRESS); // Fix web3 type
  }
  return contractRegistryInstance;
};

export const getDaoInstance = (address: string) => {
  daoInstance = new DAOInstance(window.web3, address);
  return daoInstance;
};

export const getErc20Contract = (address: string) => {
  return new window.web3.eth.Contract(ERC20 as AbiItem[], address);
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

export let masterDaoRegistryInstance: MasterDAORegistryInstance | null = null;
export let permissionManagerInstance: PermissionManagerInstance | null = null;

export const getMasterDaoRegistryInstance = (masterDaoFactoryAddress: string) => {
  if (!masterDaoRegistryInstance) {
    masterDaoRegistryInstance = new MasterDAORegistryInstance(window.web3, masterDaoFactoryAddress);
  }

  return masterDaoRegistryInstance;
};

export const getPermissionManagerInstance = (managerAddress: string) => {
  if (!permissionManagerInstance) {
    permissionManagerInstance = new PermissionManagerInstance(window.web3, managerAddress);
  }

  return permissionManagerInstance;
};

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
