import { DefaultVotingSituations } from '@q-dev/gdk-sdk';

export const AVAILABLE_VOTING_SITUATIONS = Object.freeze([
  DefaultVotingSituations.Constitution,
  DefaultVotingSituations.General,
  DefaultVotingSituations.ConfigurationParameter,
  DefaultVotingSituations.RegularParameter,
  DefaultVotingSituations.Membership,
  DefaultVotingSituations.DAORegistry,
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
