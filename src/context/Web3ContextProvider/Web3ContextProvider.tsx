import { createContext, FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { BaseContractInstance } from '@q-dev/q-js-sdk/lib/contracts/BaseContractInstance';
import { useLocalStorage } from '@q-dev/react-hooks';
import { useWeb3React } from '@web3-react/core';
import { getWallet, WalletType } from 'connectors';
import { motion } from 'framer-motion';
import Web3 from 'web3';

import { Wrap } from './styles';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';
import { useExpertPanels } from 'store/expert-panels/hooks';
import { useUser } from 'store/user/hooks';

import { getContractRegistryInstance } from 'contracts/contract-instance';

import { ZERO_ADDRESS } from 'constants/boundaries';
import {
  chainIdToNetworkMap,
  connectorParametersMap,
  networkConfigsMap,
  ORIGIN_NETWORK_NAME
} from 'constants/config';
import { LOAD_TYPES } from 'constants/statuses';
import { captureError } from 'utils/errors';

const { ethereum } = window;

export type Web3Data = {
  connectWallet: (wallet: WalletType, reload: boolean) => Promise<void>;
  loadAdditionalInfo: () => Promise<void>;
  disconnectWallet: () => void;
  error: unknown;
  loading: boolean;
  setError: (error: unknown) => void;
  chainId: number | undefined;
  switchNetwork: (chainId?: number, reload?: boolean) => Promise<void>;
  switchNetworkError: boolean | null;
  success: boolean;
  setSwitchNetworkError: (err: boolean | null) => void;
  setLoadAppType: (state: string) => void;
  isConnected: boolean;
  isRightNetwork: boolean;
};

export const Web3Context = createContext({} as Web3Data);

const Web3ContextProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const { setAddress, setChainId, address } = useUser();
  const { loadAllBalances } = useDaoVault();
  const { loadExpertPanels } = useExpertPanels();
  const { loadAllDaoInfo } = useDaoStore();

  const networkConfig = networkConfigsMap[ORIGIN_NETWORK_NAME];
  const { connector, chainId, isActive } = useWeb3React();

  const [loadAppType, setLoadAppType] = useState<string>(LOAD_TYPES.loading);
  const [selectedRpc, setSelectedRpc] = useLocalStorage('selectedRpc', networkConfig.rpcUrl);
  const [selectedWallet, setSelectedWallet] = useLocalStorage<undefined | WalletType>('selectedWallet', undefined);
  const [selectedChainId, setSelectedChainId] = useLocalStorage('selectedChainId', networkConfig.chainId);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [switchNetworkError, setSwitchNetworkError] = useState<boolean | null>(null);

  const isConnected = useMemo(
    () => Boolean(address !== ZERO_ADDRESS && isActive),
    [address, isActive]);
  const isRightNetwork = useMemo(() => Boolean(chainId && chainIdToNetworkMap[chainId]), [chainId]);

  const loadAdditionalInfo = async () => {
    await loadAllDaoInfo();
    await Promise.allSettled(
      [loadAllBalances(), loadExpertPanels()]
    );
  };

  const cleanConnectorStorage = useCallback(() => {
    localStorage.removeItem('-walletlink:https://www.walletlink.org:version');
    localStorage.removeItem('-walletlink:https://www.walletlink.org:session:id');
    localStorage.removeItem('-walletlink:https://www.walletlink.org:session:secret');
    localStorage.removeItem('-walletlink:https://www.walletlink.org:session:linked');
    localStorage.removeItem('-walletlink:https://www.walletlink.org:AppVersion');
    localStorage.removeItem('-walletlink:https://www.walletlink.org:Addresses');
    localStorage.removeItem('-walletlink:https://www.walletlink.org:walletUsername');
    localStorage.removeItem('walletconnect');
    localStorage.removeItem('selectedRpc');
    localStorage.removeItem('selectedChainId');
    localStorage.removeItem('selectedWallet');
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      setLoadAppType(LOAD_TYPES.loading);
      setSelectedWallet(undefined);
      cleanConnectorStorage();
      connector.deactivate ? await connector.deactivate() : await connector.resetState();
      if (connector && 'close' in connector) {
        // @ts-expect-error close can be returned by wallet
        await connector.close();
      }
    } catch (error) {
      setError(error);
      captureError(error);
    } finally {
      window.location.reload();
    }
  }, [connector]);

  const connectWallet = useCallback(
    async (walletType: WalletType, reload = false) => {
      try {
        setLoading(true);
        const wallet = getWallet(walletType);
        await wallet.activate();
        setSelectedWallet(walletType);

        if (reload && !isRightNetwork) {
          await providerSwitchNetwork(selectedChainId);
        }

        setSuccess(true);
        if (reload) {
          setTimeout(() => window.location.reload(), 500);
        }
      } catch (error) {
        setError(error);
        captureError(error);
      } finally {
        setLoading(false);
      }
    },
    [disconnectWallet, connector, isRightNetwork]
  );

  const initConnection = useCallback(async () => {
    try {
      const httpProvider = new Web3(new Web3.providers.HttpProvider(selectedRpc));
      if (!ethereum) {
        // user without wallet
        window.web3 = httpProvider;
        setChainId(selectedChainId);
      } else {
        const provider = getProvider(selectedWallet);
        const chainId = await getChainId(provider);
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const network = chainIdToNetworkMap[chainId];
        const isHttpProvider = !network || !accounts.length || !selectedWallet;
        window.web3 = isHttpProvider
          ? httpProvider
          : web3;

        if (selectedWallet && accounts.length) {
          setAddress(accounts[0]);
          await connectWallet(selectedWallet, false);
          setSelectedChainId(Number(chainId));
        }
        if (network) {
          BaseContractInstance.DEFAULT_GASBUFFER = networkConfigsMap[network].gasBuffer;
        }
        setChainId(isHttpProvider ? selectedChainId : Number(chainId));
      }
      getContractRegistryInstance();
      await loadAdditionalInfo();
      setLoadAppType(LOAD_TYPES.loaded);

      if (selectedWallet) {
        ethereum?.on('accountsChanged', async (e) => {
          if (e.length) {
            setLoadAppType(LOAD_TYPES.loading);
            window.location.reload();
          } else {
            await disconnectWallet();
          }
        });
        ethereum?.on('chainChanged', () => {
          setLoadAppType(LOAD_TYPES.loading);
          window.location.reload();
        });
      }
    } catch (error) {
      captureError(error);
      setLoadAppType(LOAD_TYPES.initError);
    }
  }, [ethereum]);

  const getProvider = (selectedWallet = WalletType.INJECTED) => {
    if (!ethereum.providers?.length) {
      return ethereum;
    }

    let provider;
    switch (selectedWallet) {
      case WalletType.COINBASE:
        provider = ethereum.providers.find(
          ({ isCoinbaseWallet, isCoinbaseBrowser }) => isCoinbaseWallet || isCoinbaseBrowser
        );
        break;
      case WalletType.INJECTED:
        provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask);
        break;
      default:
        provider = ethereum.providers[0];
    }

    if (provider) {
      ethereum.setSelectedProvider(provider);
    }
    return provider || ethereum.providers[0];
  };

  const getChainId = async (provider: typeof ethereum) => {
    /* Fix issue with first Metamask launch. */
    const timeout = setTimeout(() => window.location.reload(), 5000);
    const chainId = await provider.request({ method: 'net_version' });
    clearTimeout(timeout);
    return chainId;
  };

  const providerSwitchNetwork = async (newChainId: number) => {
    try {
      await connector.activate(connectorParametersMap[newChainId]);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any)?.code === -32603) {
        await connector.provider?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            ...connectorParametersMap[newChainId],
            chainId: `0x${connectorParametersMap[newChainId].chainId}`
          }]
        });
      }
      setSwitchNetworkError(true);
    }
    setSelectedChainId(newChainId);
  };

  const switchNetwork = useCallback(
    async (newChainId = networkConfig.chainId) => {
      try {
        if (!ethereum || !isConnected) {
          setSelectedChainId(newChainId);
          setSelectedRpc(connectorParametersMap[newChainId].rpcUrls[0]);
          setTimeout(() => window.location.reload(), 500);
        } else {
          await providerSwitchNetwork(newChainId);
        }
      } catch (error) {
        setError(error);
      }
    },
    [connector, chainId, isConnected]
  );

  useEffect(() => {
    initConnection();
  }, []);

  switch (loadAppType) {
    case LOAD_TYPES.initError:
      return (
        <Wrap>
          <div>
            <p>Init error</p>
            <p>Please, refresh the page</p>
          </div>
        </Wrap>
      );
    case LOAD_TYPES.loaded:
      return (
        <Web3Context.Provider
          value={{
            connectWallet,
            disconnectWallet,
            loading,
            chainId,
            success,
            error,
            setError,
            switchNetwork,
            switchNetworkError,
            setSwitchNetworkError,
            isConnected,
            isRightNetwork,
            loadAdditionalInfo,
            setLoadAppType,
          }}
        >
          {children}
        </Web3Context.Provider>
      );
    case LOAD_TYPES.loading:
    default:
      return (
        <Wrap>
          <motion.div
            className="breathing-q"
            animate={{ scale: 1.2 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeOut',
              duration: 0.5
            }}
          >
            <img
              className="breathing-q__logo"
              src="/logo.png"
              alt="q"
            />
          </motion.div>
        </Wrap>
      );
  }
};

export const useWeb3Context = () => useContext(Web3Context);

export default Web3ContextProvider;
