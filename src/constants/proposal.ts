import { DefaultVotingSituations } from '@q-dev/gdk-sdk';

export const AVAILABLE_VOTING_SITUATIONS = Object.freeze([
  DefaultVotingSituations.Constitution,
  DefaultVotingSituations.General,
  DefaultVotingSituations.ConfigurationParameter,
  DefaultVotingSituations.RegularParameter,
  DefaultVotingSituations.Membership,
  DefaultVotingSituations.DAORegistry,
  DefaultVotingSituations.PermissionManager
]);

export const ABI_NAME_BY_SITUATION_MAP: Record<DefaultVotingSituations, string> = Object.freeze({
  [DefaultVotingSituations.General]: 'GeneralDAOVoting',
  [DefaultVotingSituations.ConfigurationParameter]: 'DAOParameterStorage',
  [DefaultVotingSituations.RegularParameter]: 'DAOParameterStorage',
  [DefaultVotingSituations.Constitution]: 'DAOParameterStorage',
  [DefaultVotingSituations.Membership]: 'DAOMemberStorage',
  [DefaultVotingSituations.PermissionManager]: 'PermissionManager',
  [DefaultVotingSituations.DAORegistry]: 'DAORegistry',
});

export const DAO_REGISTRY_AVAILABLE_FUNCTIONS = Object.freeze([
  'function addContract(string name_, address contractAddress_)',
  'function addProxyContract(string name_, address contractAddress_)',
  'function injectDependencies(string name_)',
  'function justAddProxyContract(string name_, address contractAddress_)',
  'function removeContract(string name_)',
  'function upgradeContract(string name_, address newImplementation_)',
  'function upgradeContractAndCall(string name_, address newImplementation_, bytes data_)',
]);

export const PERMISSION_MANAGER_AVAILABLE_FUNCTIONS = Object.freeze([
  'function addVetoGroup(address target_, address linkedMemberStorage_)',
  'function confExternalModule(address dao_, string moduleName_)',
  'function removeVetoGroup(address target_)'
]);
