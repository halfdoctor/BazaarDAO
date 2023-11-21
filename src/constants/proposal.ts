import { DefaultVotingSituations, VotingType } from '@q-dev/gdk-sdk';
import { GeneralSituationType } from 'typings/forms';

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

export const GENERAL_SITUATION_TYPE_TRANSLATION_KEY_MAP: Record<GeneralSituationType, string> = {
  'raise-topic': 'RAISE_SOME_TOPIC',
  'create-voting': 'CREATE_VOTING_SITUATION',
  'remove-voting': 'REMOVE_VOTING_SITUATION'
};

export const VOTING_TYPE_TRANSLATION_KEY_MAP: Record<VotingType, string> = {
  [VotingType.NonRestricted]: 'COMMUNITY_VOTING',
  [VotingType.Restricted]: 'EXPERTS_VOTING',
  [VotingType.PartiallyRestricted]: 'EXPERTS_INITIATE_AND_ANYONE_VOTE'
};
