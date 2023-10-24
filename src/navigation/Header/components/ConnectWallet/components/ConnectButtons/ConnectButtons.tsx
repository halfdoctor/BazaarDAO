import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PROVIDERS } from '@distributedlab/w3p';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { ErrorHandler, isMobile } from 'helpers';

import Button from 'components/Button';

function ConnectButton () {
  const { t } = useTranslation();
  const { init, providerDetector } = useWeb3Context();
  const [isLoading, setIsLoading] = useState(false);

  const buttons = [
    {
      name: 'MetaMask',
      downloadLink: 'https://metamask.io/download',
      appConnectUrl: `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`,
      iconSrc: '/icons/metamask.svg',
      provider: PROVIDERS.Metamask,
      isProviderDetected: Boolean(providerDetector.providers?.metamask),
    },
    {
      name: 'Coinbase',
      downloadLink: 'https://www.coinbase.com/wallet/downloads',
      appConnectUrl: `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.host + window.location.pathname)}`,
      iconSrc: '/icons/coinbase.png',
      provider: PROVIDERS.Coinbase,
      isProviderDetected: Boolean(providerDetector.providers?.coinbase),
    }
  ];

  const connectWallet = async (provider: PROVIDERS) => {
    setIsLoading(true);
    try {
      await init(provider);
    } catch (error) {
      ErrorHandler.process(error, t('ERROR_WHILE_CONNECTING_TO_WALLET'));
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
      {buttons.map((item, index) => (
        <Fragment key={index}>
          {item.isProviderDetected
            ? (
              <Button
                alwaysEnabled
                style={{ width: '100%' }}
                onClick={() => connectWallet(item.provider)}
              >
                <img
                  src={item.iconSrc}
                  alt={item.name}
                  className="connect-buttons__icon"
                />
                <span>{t('CONNECT_WITH_PROVIDER', { name: item.name })}</span>
              </Button>
            )
            : (
              <a
                href={isMobile() ? item.appConnectUrl : item.downloadLink}
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  alwaysEnabled
                  block
                  style={{ width: '100%' }}
                >
                  <img
                    src={item.iconSrc}
                    alt={item.name}
                    className="connect-buttons__icon"
                  />
                  <span>
                    {isMobile()
                      ? t('GO_TO_PROVIDER', { name: item.name })
                      : t('INSTALL_PROVIDER', { name: item.name })
                    }
                  </span>
                </Button>
              </a>
            )}
        </Fragment>
      ))}
    </div>
  );
}

export default ConnectButton;
