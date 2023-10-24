import { createContext, FC, ReactElement, useContext, useEffect, useMemo, useState } from 'react';

import {
  ChainId,
  CoinbaseProvider,
  EthereumProvider,
  MetamaskProvider,
  ProviderDetector,
  ProviderProxyConstructor,
  PROVIDERS,
} from '@distributedlab/w3p';
import { useLocalStorage } from '@q-dev/react-hooks';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { DevnetFallback, ErrorHandler, MainnetFallback, TestnetFallback } from 'helpers';
import { ProviderWrapper, SupportedProviders } from 'typings';

import { useProvider } from 'hooks';

import { Wrap } from './styles';

import { chainIdToNetworkMap, connectorParametersMap, ORIGIN_NETWORK_NAME } from 'constants/config';
import { FALLBACK_PROVIDER_NAMES, FALLBACK_PROVIDERS } from 'constants/providers';
import { LOAD_TYPES } from 'constants/statuses';

export interface Web3Data extends Omit<ProviderWrapper, 'init' | 'switchNetwork'> {
  init: (providerType?: SupportedProviders) => Promise<void>;
  switchNetwork: (chainId: ChainId) => Promise<void> | undefined;
  isRightNetwork: boolean;
  providerDetector: ProviderDetector<FALLBACK_PROVIDER_NAMES>;
};

function getFallbackProviderType (chainId?: number | string) {
  const networkName = chainId
    ? chainIdToNetworkMap[+chainId] || ORIGIN_NETWORK_NAME
    : ORIGIN_NETWORK_NAME;
  switch (networkName) {
    case 'mainnet':
      return FALLBACK_PROVIDER_NAMES.mainnetFallback;
    case 'testnet':
      return FALLBACK_PROVIDER_NAMES.testnetFallback;
    case 'devnet':
      return FALLBACK_PROVIDER_NAMES.devnetFallback;
  }
}

export const Web3Context = createContext({} as Web3Data);

const Web3ContextProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const providerDetector = useMemo(
    () => new ProviderDetector<FALLBACK_PROVIDER_NAMES>(),
    []);
  const provider = useProvider();

  const [loadAppType, setLoadAppType] = useState(LOAD_TYPES.loading);
  const [storeProviderType, setStoreProviderType] = useLocalStorage<SupportedProviders>('providerType', getFallbackProviderType());

  const isRightNetwork = useMemo(() => Boolean(provider.chainId && chainIdToNetworkMap[provider.chainId]), [provider]);

  async function init (providerType?: SupportedProviders) {
    setLoadAppType(LOAD_TYPES.loading);
    try {
      await providerDetector.init();

      addFallbackProvider();

      const supportedProviders: {
        [key in SupportedProviders]?: ProviderProxyConstructor
      } = {
        [FALLBACK_PROVIDER_NAMES.mainnetFallback]: MainnetFallback,
        [FALLBACK_PROVIDER_NAMES.testnetFallback]: TestnetFallback,
        [FALLBACK_PROVIDER_NAMES.devnetFallback]: DevnetFallback,
        [PROVIDERS.Metamask]: MetamaskProvider,
        [PROVIDERS.Coinbase]: CoinbaseProvider,
      };

      const currentProviderType: SupportedProviders = providerType ?? storeProviderType;

      const providerProxyConstructor: ProviderProxyConstructor =
        supportedProviders[currentProviderType]!;

      const { isConnected } = await provider.init(providerProxyConstructor, {
        providerDetector,
        listeners: {
          onDisconnect: (e) => {
            const providerType = getFallbackProviderType(e?.chainId);
            setStoreProviderType(providerType);
          },
        }
      });

      if (!isConnected) {
        await provider.connect();
      }

      setStoreProviderType(currentProviderType);
      setLoadAppType(LOAD_TYPES.loaded);
    } catch (error) {
      setStoreProviderType(getFallbackProviderType());
      setLoadAppType(LOAD_TYPES.loaded); // TODO: need handle errors like "User reject"
      throw error;
    }
  }

  function addFallbackProvider () {
    Object.values(FALLBACK_PROVIDERS).forEach(({ name, rpcUrl }) => {
      if (providerDetector.providers?.[name]) return;
      providerDetector.addProvider({
        name,
        instance: new ethers.providers.JsonRpcProvider(
          rpcUrl,
          'any',
        ) as unknown as EthereumProvider,
      });
    });
  }

  async function disconnect () {
    const providerType = getFallbackProviderType(provider.chainId || 0);
    try {
      await provider.disconnect();
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }

    await init(providerType);
  }

  async function switchNetwork (chainId: ChainId) {
    if (provider) {
      switch (provider.providerType) {
        case FALLBACK_PROVIDER_NAMES.mainnetFallback:
        case FALLBACK_PROVIDER_NAMES.testnetFallback:
        case FALLBACK_PROVIDER_NAMES.devnetFallback:
          const providerType = getFallbackProviderType(chainId);
          if (!providerType || provider.providerType === providerType) return;
          return init(providerType);
        default:
          const chainInfo = connectorParametersMap[+chainId];
          return provider?.switchNetwork(chainId, chainInfo);
      }
    }
  }

  useEffect(() => {
    init();
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
          key={provider.chainId + provider.address + provider.isConnected}
          value={{
            ...provider,
            switchNetwork,
            isRightNetwork,
            init,
            disconnect,
            providerDetector,
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
