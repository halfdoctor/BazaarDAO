
import { captureError } from 'utils/errors';

export async function getMinimalActiveBlockHeight () {
  try {
    const lastBlockHeight = await fetchBlockNumber('latest');
    const minimalActiveBlockHeight = Math.max(0, Number(lastBlockHeight) - 1_000_000);
    return {
      minimalActiveBlockHeight,
      lastBlockHeight,
    };
  } catch (error) {
    captureError(error);
    return {
      minimalActiveBlockHeight: 0,
      lastBlockHeight: 'latest',
    };
  }
}

export async function fetchBlockNumber (block = 'latest') {
  try {
    const { number } = await window?.web3?.eth.getBlock(block);
    return number;
  } catch (error) {
    captureError(error);
    return 0;
  }
}
