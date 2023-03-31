import { toBigNumber } from '@q-dev/utils';
import { isAddress as isWeb3Address } from 'web3-utils';

export function isAddress (value: string) {
  return isWeb3Address(value.toLowerCase());
}

export function toWeiWithDecimals (value: number | string, decimals: number) {
  return toBigNumber(value)
    .multipliedBy(10 ** decimals)
    .toFixed();
}

export function fromWeiWithDecimals (value: number | string, decimals: number) {
  return toBigNumber(value)
    .dividedBy(10 ** decimals)
    .toFixed();
}
