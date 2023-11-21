import { IDAOResource__factory as IDAOResourceFactory } from '@q-dev/gdk-sdk/lib/ethers-contracts/factories/IDAOResource__factory';
import type { providers, Signer } from 'ethers';
import { ErrorHandler } from 'helpers';

export const getDAOResourceContractInstance = (address: string, provider: Signer | providers.Provider) => {
  return IDAOResourceFactory.connect(address, provider);
};

export const checkSupportingExternalSituationContractAddress =
  async (address: string, provider: providers.Provider, userAddress: string) => {
    try {
      const contract = getDAOResourceContractInstance(address, provider);
      await Promise.all([
        contract.getResource(),
        contract.checkPermission(userAddress, ''),
      ]);

      return true;
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
      return false;
    }
  };
