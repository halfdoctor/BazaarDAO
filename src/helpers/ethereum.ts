import { toBigNumber } from '@q-dev/utils';
import { providers, utils } from 'ethers';

interface TokenParams {
  address: string;
  symbol: string;
  decimals: number | string;
  image?: string;
}

export function isAddress (value: string) {
  return utils.isAddress(value);
}

export function isBytesLike (value: string) {
  return utils.isBytesLike(value);
}

export function isBytes (value: string, bytes: number) {
  return utils.isBytesLike(value) && value.replace('0x', '').length === bytes * 2;
}

export function singlePrecision (amount?: string | number) {
  return amount ? toBigNumber(amount).div(1e25).toString() : '0';
}

export async function requestAddErc20 (
  provider: providers.Web3Provider,
  { address, symbol, decimals, image }: TokenParams
) {
  return provider.send('wallet_watchAsset', {
    /* @ts-ignore: Ethers type error */
    type: 'ERC20',
    options: {
      address,
      symbol,
      decimals,
      image: image!,
    },
  });
}
