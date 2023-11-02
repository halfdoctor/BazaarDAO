import { Fragment, JsonFragment } from '@ethersproject/abi';
import { utils } from 'ethers';

export function formatJsonAbi (abi: string | ReadonlyArray<Fragment | JsonFragment | string>) {
  try {
    const abiInterface = new utils.Interface(abi);
    return abiInterface.format(utils.FormatTypes.json) as string;
  } catch (e) {
    console.error(e);
    return '';
  }
}

export function formatFunctionAbi (abi: string | ReadonlyArray<Fragment | JsonFragment | string>) {
  try {
    const abiInterface = new utils.Interface(abi);
    return abiInterface.format(utils.FormatTypes.full) as string[];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function formatFunctionMinimalAbi (abi: string | ReadonlyArray<Fragment | JsonFragment | string>) {
  try {
    const abiInterface = new utils.Interface(abi);
    return abiInterface.format(utils.FormatTypes.minimal) as string[];
  } catch (e) {
    console.error(e);
    return [];
  }
}
