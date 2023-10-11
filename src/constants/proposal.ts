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

export const DAO_REGISTRY_AVAILABLE_FUNCTIONS = Object.freeze({
  injectDependencies: 'injectDependencies',
  upgradeContract: 'upgradeContract',
  upgradeContractAndCall: 'upgradeContractAndCall',
  addContract: 'addContract',
  addProxyContract: 'addProxyContract',
  justAddProxyContract: 'justAddProxyContract',
  removeContract: 'removeContract'
});

export const PERMISSION_MANAGER_AVAILABLE_FUNCTIONS = Object.freeze({
  confExternalModule: 'confExternalModule',
  addVetoGroup: 'addVetoGroup',
  removeVetoGroup: 'removeVetoGroup',
});
