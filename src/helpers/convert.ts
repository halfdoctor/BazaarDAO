import { toBigNumber } from '@q-dev/utils';

export function singlePrecision (amount?: string | number) {
  return amount ? toBigNumber(amount).div(1e25).toString() : '0';
};
