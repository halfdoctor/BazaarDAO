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
