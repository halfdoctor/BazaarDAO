import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { useWeb3Context } from 'context/Web3ContextProvider';
import { Wrap } from 'context/Web3ContextProvider/styles';
import { motion } from 'framer-motion';
import { ErrorHandler, getDaoSupportedNetworks } from 'helpers';

import useLoadDao from 'hooks/useLoadDao';

import { useDaoStore } from 'store/dao/hooks';
import { setProvider, useProviderStore } from 'store/provider/hooks';

import { PROVIDERS } from 'constants/providers';

interface Props {
  children: ReactNode;
}

function DaoInitializer ({ children }: Props) {
  const { pathname } = useLocation();
  const [isInfoLoaded, setIsInfoLoaded] = useState(false);
  const [isDaoAddressChecked, setIsDaoAddressChecked] = useState(false);
  const { currentProvider, isWeb3Loaded, initDefaultProvider } = useWeb3Context();
  const { setDaoAddress, daoAddress, setSupportedNetworks, supportedNetworks } = useDaoStore();
  const { currentProvider: storeProvider, isRightNetwork } = useProviderStore();
  const { loadAdditionalInfo } = useLoadDao();

  const [test, setTest] = useState(currentProvider);
  console.log('currentProvider', currentProvider);
  console.log('storeProvider', storeProvider);
  console.log('test', test);

  const loadAppDetails = async () => {
    if (!isWeb3Loaded || !storeProvider || !isDaoAddressChecked || !isRightNetwork) return;

    setIsInfoLoaded(false);
    try {
      await loadAdditionalInfo();
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
    setIsInfoLoaded(true);
  };

  const initDaoAddress = async () => {
    try {
      const pathAddress = pathname.split('/')[1] || '';
      if (pathAddress !== daoAddress) {
        setIsDaoAddressChecked(false);
        const chains = await getDaoSupportedNetworks(pathAddress);
        const supportedChains = chains.filter(item => item.isDaoExist);
        setDaoAddress(pathAddress);
        setSupportedNetworks(supportedChains);
      }
      setIsDaoAddressChecked(true);
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  };

  const tryInitProvider = async () => {
    try {
      if (storeProvider?.selectedProvider !== PROVIDERS.default) return;
      const isDaoInitOnSupportedChain = supportedNetworks.find(item => item.chainId === storeProvider.chainId);
      if (isDaoInitOnSupportedChain && supportedNetworks.length) {
        await initDefaultProvider(isDaoInitOnSupportedChain.chainId);
      }
    } catch (error) {
      ErrorHandler.processWithoutFeedback(error);
    }
  };

  useEffect(() => {
    if (currentProvider?.provider) {
      setProvider(currentProvider);
      setTest(currentProvider);
      tryInitProvider();
    }
  }, [currentProvider]);

  useEffect(() => {
    loadAppDetails();
  }, [storeProvider, isDaoAddressChecked, isRightNetwork]);

  useEffect(() => {
    initDaoAddress();
  }, [pathname]);

  if (!isWeb3Loaded || !isInfoLoaded || !storeProvider?.provider || !isDaoAddressChecked) {
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

  return (
    <div>
      {children}
    </div>
  );
}

export default DaoInitializer;
