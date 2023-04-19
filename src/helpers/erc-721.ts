
import { QRC721 } from '@q-dev/gdk-sdk';
import { QRC721__factory as Erc721 } from '@q-dev/gdk-sdk/lib/ethers-contracts/factories/QRC721__factory';
import { providers, Signer } from 'ethers';
import { handleEthError } from 'helpers';
import { EthProviderRpcError, UseProvider } from 'typings';

export let erc721ContractInstance: QRC721 | null = null;
export let erc721ContractSigner: QRC721 | null = null;

export const getErc721ContractInstance = (address: string, provider: Signer | providers.Provider) => {
  erc721ContractInstance = Erc721.connect(address, provider);
  return erc721ContractInstance;
};

export const getErc721ContractSigner = (address: string, signer: Signer) => {
  erc721ContractSigner = Erc721.connect(address, signer);
  return erc721ContractSigner;
};

export const loadDetailsErc721 = async (provider: UseProvider) => {
  try {
    const [_name, _owner, _symbol, _totalSupply, _balance, _totalSupplyCap] =
      await Promise.all([
        getNameErc721(),
        getOwnerErc721(),
        getSymbolErc721(),
        getTotalSupplyErc721(),
        provider?.selectedAddress ? getBalanceOfErc721(provider.selectedAddress) : '0',
        getTotalSupplyCapErc721()
      ]);
    return {
      decimals: 0,
      name: _name || '',
      owner: _owner || '',
      symbol: _symbol || '',
      totalSupply: _totalSupply || '',
      balance: _balance || '',
      totalSupplyCap: _totalSupplyCap || '',
    };
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
  }
};

export const mintToErc721 = async (address: string, amount: string | number, tokenURI: string) => {
  if (!erc721ContractSigner || !address) return;

  try {
    return erc721ContractSigner?.mintTo(address, amount, tokenURI);
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
  }
};
export const setApprovalForAllErc721 = async (address: string, status: boolean) => {
  if (!erc721ContractSigner || !address) return;

  try {
    return erc721ContractSigner?.setApprovalForAll(address, status);
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
  }
};

export async function getTokenOfOwnerByIndexErc721 (selectedAddress: string, index: string | number) {
  if (!erc721ContractInstance || !selectedAddress) return '0';
  try {
    return (await erc721ContractInstance?.tokenOfOwnerByIndex(selectedAddress, index)).toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '0';
  }
}
export async function getIsApprovedForAllErc721 (tokenAddress: string, selectedAddress: string) {
  if (!erc721ContractInstance || !selectedAddress) return false;
  try {
    return erc721ContractInstance?.isApprovedForAll(selectedAddress, tokenAddress);
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return false;
  }
}

export const getBalanceOfErc721 = async (address: string) => {
  if (!erc721ContractInstance || !address) return '0';

  try {
    const balance = await erc721ContractInstance.balanceOf(address);
    return balance.toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '0';
  }
};

export async function getTotalSupplyCapErc721 () {
  if (!erc721ContractInstance) return;

  try {
    const totalSupplyCap = await erc721ContractInstance?.totalSupplyCap();
    return totalSupplyCap.toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
}

export const getNameErc721 = async () => {
  if (!erc721ContractInstance) return;

  try {
    return erc721ContractInstance?.name();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
};

export const getOwnerErc721 = async () => {
  if (!erc721ContractInstance) return;

  try {
    return erc721ContractInstance?.owner();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
};

export const getSymbolErc721 = async () => {
  if (!erc721ContractInstance) return;

  try {
    return erc721ContractInstance?.symbol();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
};

export const getTotalSupplyErc721 = async () => {
  if (!erc721ContractInstance) return;

  try {
    return (await erc721ContractInstance?.totalSupply()).toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '0';
  }
};
