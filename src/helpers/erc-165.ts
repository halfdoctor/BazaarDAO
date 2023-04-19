
import { IERC165__factory as ERC165F } from '@q-dev/gdk-sdk/lib/ethers-contracts/factories/IERC165__factory';
import { IERC165 } from '@q-dev/gdk-sdk/lib/ethers-contracts/IERC165';
import { providers, Signer } from 'ethers';
import { handleEthError } from 'helpers';
import { EthProviderRpcError } from 'typings';

export let erc165ContractInstance: IERC165 | null = null;

export const getErc165ContractInstance = (address: string, provider: Signer | providers.Provider) => {
  erc165ContractInstance = ERC165F.connect(address, provider);
  return erc165ContractInstance;
};

export const getIsSupportedInterface = async (interfaceId: string) => {
  if (!erc165ContractInstance) return false;
  try {
    const isSupportedInterface = await erc165ContractInstance?.supportsInterface(interfaceId);
    return isSupportedInterface;
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return false;
  }
};
