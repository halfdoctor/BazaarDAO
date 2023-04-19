import { createContext, FC, ReactElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useLocalStorage } from '@q-dev/react-hooks';
import { motion } from 'framer-motion';

import { UseProvider, useProvider, useWeb3 } from 'hooks';

import { Wrap } from './styles';

import { chainIdToNetworkMap, networkConfigsMap, ORIGIN_NETWORK_NAME } from 'constants/config';
import { PROVIDERS } from 'constants/providers';
import { LOAD_TYPES } from 'constants/statuses';
import { captureError } from 'utils/errors';

export type Web3Data = {
  currentProvider: UseProvider;
  isRightNetwork: boolean;
  setLoadAppType: (state: string) => void;
  connect: (provider: PROVIDERS) => Promise<void>;
  disconnect: () => void;
};

export const Web3Context = createContext({} as Web3Data);

const Web3ContextProvider: FC<{ children: ReactElement }> = ({ children }) => {
  const web3 = useWeb3();
  const metamaskProvider = useProvider();
  const defaultProvider = useProvider();
  const [loadAppType, setLoadAppType] = useState(LOAD_TYPES.loading);
  const [selectedProvider, setSelectedProvider] = useLocalStorage<undefined | PROVIDERS>('selectedProvider', undefined);

  const providers = useMemo(
    () => [metamaskProvider, defaultProvider],
    [metamaskProvider, defaultProvider],
  );

  const currentProvider = useMemo(() => {
    const selectProvider = providers.find(el => el?.selectedProvider === selectedProvider && el.selectedAddress);
    return selectProvider || defaultProvider;
  }, [metamaskProvider, defaultProvider, selectedProvider]);

  const isRightNetwork = useMemo(() => Boolean(currentProvider?.chainId &&
    chainIdToNetworkMap[currentProvider?.chainId]), [currentProvider]);

  const initWeb3Providers = useCallback(async () => {
    try {
      await web3.init();
    } catch (error) {
      captureError(error);
      setLoadAppType(LOAD_TYPES.initError);
    }
  }, [web3]);

  const initProviderWrappers = useCallback(() => {
    setLoadAppType(LOAD_TYPES.loading);
    try {
      const metamaskBrowserProvider = web3.providers.find(
        (el: { name: PROVIDERS }) => el.name === PROVIDERS.metamask,
      );
      if (metamaskBrowserProvider) {
        metamaskProvider.init(metamaskBrowserProvider);
      }
      defaultProvider.init({ name: PROVIDERS.default, instance: networkConfigsMap[ORIGIN_NETWORK_NAME].rpcUrl });
    } catch (error) {
      captureError(error);
      return setLoadAppType(LOAD_TYPES.initError);
    }
    setLoadAppType(LOAD_TYPES.loaded);
  }, [web3.providers]);

  const connect = async (provider: PROVIDERS) => {
    setSelectedProvider(provider);
    await initProviderWrappers();
    const foundedProvider = providers.find(item => item.selectedProvider === provider);
    if (foundedProvider && !foundedProvider.isConnected) {
      await foundedProvider.connect();
    }
  };

  const disconnect = () => {
    const filteredProviders = providers.filter(item => item.selectedProvider !== currentProvider.selectedProvider);
    setSelectedProvider(filteredProviders[0].selectedProvider);
    currentProvider.disconnect();
  };

  useEffect(() => {
    initWeb3Providers();
  }, []);

  useEffect(() => {
    initProviderWrappers();
  }, [
    web3.providers,
  ]);

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
            currentProvider,
            isRightNetwork,
            setLoadAppType,
            connect,
            disconnect
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
