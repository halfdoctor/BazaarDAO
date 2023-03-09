import { isAddress as isWeb3Address } from 'web3-utils';

export function isAddress (value: string) {
  return isWeb3Address(value.toLowerCase());
}
