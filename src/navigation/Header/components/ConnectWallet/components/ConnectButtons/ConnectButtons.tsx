import { useEffect, useState } from 'react';
import { useAlert } from 'react-alert';
import { useTranslation } from 'react-i18next';

import { useWeb3Context } from 'context/Web3ContextProvider';

import Button from 'components/Button';

import { PROVIDERS } from 'constants/providers';
import { captureError } from 'utils/errors';

function ConnectButtons () {
  const alert = useAlert();
  const { t } = useTranslation();
  const { connect } = useWeb3Context();
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async (provider: PROVIDERS) => {
    setIsLoading(true);
    try {
      await connect(provider);
    } catch (error) {
      captureError(error);
      alert.error(t('ERROR_WHILE_CONNECTING_TO_WALLET'));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  if (isLoading) {
    return <div className="connect-loading">{t('LOADING')}</div>;
  }

  return (
    <div className="connect-buttons">
      {window.ethereum?.isMetaMask
        ? (
          <Button
            alwaysEnabled
            style={{ width: '100%' }}
            onClick={() => connectWallet(PROVIDERS.metamask)}
          >
            <img
              src="/icons/metamask.svg"
              alt="metamask"
              className="connect-buttons__icon"
            />
            <span>{t('CONNECT_WITH_METAMASK')}</span>
          </Button>
        )
        : (
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              alwaysEnabled
              block
              style={{ width: '100%' }}
            >
              <img
                src="/icons/metamask.svg"
                alt="metamask"
                className="connect-buttons__icon"
              />
              <span>{t('INSTALL_METAMASK')}</span>
            </Button>
          </a>
        )}
    </div>
  );
}

export default ConnectButtons;
