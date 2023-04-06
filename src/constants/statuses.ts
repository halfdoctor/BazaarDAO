export const TRANSACTION_TYPES = {
  success: 'Success',
  rejected: 'Rejected',
};

export const LOAD_TYPES = {
  error: 'error',
  loaded: 'loaded',
  loading: 'loading',
  initError: 'init-error',
  notLogged: 'not-logged',
  notInstalled: 'not-installed',
  wrongNetwork: 'wrong-network',
};

export enum TimeLockStatus {
  locked = 'locked',
  unlocking = 'unlocking',
  unlocked = 'unlocked',
}

export enum ProposalStatus {
  NONE = '0',
  PENDING = '1',
  REJECTED = '2',
  ACCEPTED = '3',
  PASSED = '4',
  EXECUTED = '5',
  OBSOLETE = '6',
  EXPIRED = '7'
}
