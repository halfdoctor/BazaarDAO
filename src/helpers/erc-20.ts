
import { QRC20 } from '@q-dev/gdk-sdk';
import { QRC20__factory as Erc20 } from '@q-dev/gdk-sdk/lib/ethers-contracts/factories/QRC20__factory';
import { providers, Signer } from 'ethers';
import { handleEthError } from 'helpers';
import { EthProviderRpcError, UseProvider } from 'typings';

export let erc20ContractInstance: QRC20 | null = null;
export let erc20ContractSigner: QRC20 | null = null;

export const getErc20ContractInstance = (address: string, provider: Signer | providers.Provider) => {
  erc20ContractInstance = Erc20.connect(address, provider);
  return erc20ContractInstance;
};

export const getErc20ContractSigner = (address: string, signer: Signer) => {
  erc20ContractSigner = Erc20.connect(address, signer);
  return erc20ContractSigner;
};

export const loadDetailsErc20 = async (provider: UseProvider) => {
  try {
    const [_decimals, _name, _owner, _symbol, _totalSupply, _balance, _totalSupplyCap] =
      await Promise.all([
        getDecimalsErc20(),
        getNameErc20(),
        getOwnerErc20(),
        getSymbolErc20(),
        getTotalSupplyErc20(),
        provider?.selectedAddress ? getBalanceOfErc20(provider.selectedAddress) : '0',
        getTotalSupplyCapErc20()
      ]);
    return {
      decimals: _decimals || 0,
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

export const approveErc20 = async (address: string, amount: string, userAddress: string) => {
  if (!erc20ContractSigner || !address) return;
  try {
    return erc20ContractSigner.approve(address, amount, { from: userAddress });
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
  }
};

export const mintToErc20 = async (address: string, amount: string) => {
  if (!erc20ContractSigner || !address) return;

  try {
    return erc20ContractSigner?.mintTo(address, amount);
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
  }
};

export const getAllowanceErc20 = async (owner: string, spender: string) => {
  if (!erc20ContractInstance || !owner) return '0';

  try {
    return (await erc20ContractInstance?.allowance(owner, spender)).toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '0';
  }
};

export const getBalanceOfErc20 = async (address: string) => {
  if (!erc20ContractInstance || !address) return '0';

  try {
    return (await erc20ContractInstance?.balanceOf(address)).toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '0';
  }
};

export const getDecimalsErc20 = async () => {
  if (!erc20ContractInstance) return;

  try {
    return erc20ContractInstance?.decimals();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return 0;
  }
};

export async function getTotalSupplyCapErc20 () {
  if (!erc20ContractInstance) return;

  try {
    const totalSupplyCap = await erc20ContractInstance?.totalSupplyCap();
    return totalSupplyCap.toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
}

export const getNameErc20 = async () => {
  if (!erc20ContractInstance) return;

  try {
    return erc20ContractInstance?.name();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
};

export const getOwnerErc20 = async () => {
  if (!erc20ContractInstance) return;

  try {
    return erc20ContractInstance?.owner();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
};

export const getSymbolErc20 = async () => {
  if (!erc20ContractInstance) return;

  try {
    return erc20ContractInstance?.symbol();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '';
  }
};

export const getTotalSupplyErc20 = async () => {
  if (!erc20ContractInstance) return;

  try {
    return (await erc20ContractInstance?.totalSupply()).toString();
  } catch (error) {
    handleEthError(error as EthProviderRpcError);
    return '0';
  }
};
