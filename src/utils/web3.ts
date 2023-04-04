import { toBigNumber } from '@q-dev/utils';
import { isAddress as isWeb3Address } from 'web3-utils';

export function isAddress (value: string) {
  return isWeb3Address(value.toLowerCase());
}

export function singlePrecision (amount?: string | number) {
  return amount ? toBigNumber(amount).div(1e25).toString() : '0';
}
