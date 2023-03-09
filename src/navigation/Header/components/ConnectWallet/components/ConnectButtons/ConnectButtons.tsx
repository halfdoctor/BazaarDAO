import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { WalletType } from 'connectors';
import { useWeb3Context } from 'context/Web3ContextProvider';

import Button from 'components/Button';

function ConnectButtons () {
  const { t } = useTranslation();

  const { connectWallet, success, loading, error, setError } = useWeb3Context();

  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  if (success) {
    return (
      <div className="connect">
        <h5>{t('SUCCESS')}</h5>
        <p>{t('REFRESHING_THE_PAGE')}</p>
      </div>
    );
  }

  if (loading) {
    return <div className="connect-loading">{t('LOADING')}</div>;
  }

  if (error) {
    return (
      <div className="connect">
        <p>{t('ERROR_WHILE_CONNECTING_TO_WALLET')}</p>
      </div>
    );
  }

  return (
    <div className="connect-buttons">
      {window.ethereum?.isMetaMask
        ? (
          <Button
            alwaysEnabled
            style={{ width: '100%' }}
            onClick={() => connectWallet(WalletType.INJECTED, true)}
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

      {/* TODO: display after fix connect
      {Boolean(window.ethereum) && (
        <Button
          alwaysEnabled
          style={{ width: '100%' }}
          onClick={() => connectWallet(WalletType.COINBASE, true)}
        >
          <img
            src="/icons/coinbase.png"
            alt="Coinbase"
            className="connect-buttons__icon"
          />
          <span>{t('CONNECT_WITH_COINBASE')}</span>
        </Button>
      )} */}

      {/* TODO: add bridge between dApp and connect to wallet
       <Button
        alwaysEnabled
        style={{ width: '100%' }}
        onClick={() => connectWallet(WalletType.WALLET_CONNECT, true)}
      >
        Connect with Wallet Connect
      </Button> */}
    </div>
  );
}

export default ConnectButtons;
