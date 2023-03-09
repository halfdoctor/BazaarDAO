import { fromWei } from 'web3-utils';

import { getEpdrParametersInstance } from 'contracts/contract-instance';

export async function getEPDRUint (key: string) {
  try {
    const contract = await getEpdrParametersInstance();
    const amount = await contract.getUint(key);
    return fromWei(amount);
  } catch (error) {
    return 0;
  }
}
