import { toBigNumber } from '@q-dev/utils';

export function toDecimals (value: number | string, decimals: number) {
  return toBigNumber(value)
    .multipliedBy(10 ** decimals)
    .toFixed();
}

export function fromDecimals (value: number | string, decimals: number) {
  return toBigNumber(value)
    .dividedBy(10 ** decimals)
    .toFixed();
}
