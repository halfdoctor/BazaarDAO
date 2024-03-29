import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { useWeb3Context } from 'context/Web3ContextProvider';
import { Wrap } from 'context/Web3ContextProvider/styles';
import { motion } from 'framer-motion';
import { ErrorHandler, getDaoSupportedNetworks } from 'helpers';

import NetworkWarning from 'components/NetworkWarning';

import useLoadDao from 'hooks/useLoadDao';

import { useConstitution } from 'store/constitution/hooks';
import { useDaoStore } from 'store/dao/hooks';
import { useDaoVault } from 'store/dao-vault/hooks';

interface Props {
  children: ReactNode;
}

function DaoInitializer ({ children }: Props) {
  const { pathname } = useLocation();
  const [isInfoLoaded, setIsInfoLoaded] = useState(false);
  const [isDaoAddressChecked, setIsDaoAddressChecked] = useState(false);
  const { currentProvider, isRightNetwork, isConnected } = useWeb3Context();
  const { setDaoAddress, daoAddress, setSupportedNetworks } = useDaoStore();
  const { loadConstitutionData } = useDaoVault();
  const { loadAdditionalInfo } = useLoadDao();
  const { loadConstitutionHash } = useConstitution();

  const loadAppDetails = async () => {
    if (!currentProvider || !isDaoAddressChecked || !isRightNetwork) return;

    setIsInfoLoaded(false);
    try {
      await loadAdditionalInfo();
      await Promise.all([
        loadConstitutionHash(),
        loadConstitutionData()
      ]);
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

  useEffect(() => {
    loadAppDetails();
  }, [currentProvider, isDaoAddressChecked, isRightNetwork]);

  useEffect(() => {
    initDaoAddress();
  }, [pathname]);

  if (isConnected && !isRightNetwork) {
    return (
      <NetworkWarning />
    );
  }

  if (!isInfoLoaded || !currentProvider || !isDaoAddressChecked) {
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
