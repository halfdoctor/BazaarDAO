import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useWeb3Context } from 'context/Web3ContextProvider';

import logo from 'assets/img/logo.png';
import Button from 'components/Button';

import useDao from 'hooks/useDao';

import Balance from './components/Balance';
import ConnectWallet from './components/ConnectWallet';
import Network from './components/Network';
import Settings from './components/Settings';
import WalletDropdown from './components/WalletDropdown';
import { StyledHeader } from './styles';

function Header ({ onMenuClick }: { onMenuClick: () => void }) {
  const { t } = useTranslation();
  const { isConnected } = useWeb3Context();
  const { isDaoPage } = useDao();

  return (
    <StyledHeader>
      <div className="header__content">
        <div className="header__left">
          <div className="header__network">
            {isDaoPage
              ? <Network />
              : (
                <div className="header__logo-wrp">
                  <img
                    className="header__logo"
                    alt="Q Logo"
                    src={logo}
                  />

                  <p className="header__logo-title text-h2">
                    {t('DAO_DASHBOARD')}
                  </p>
                </div>
              )}
          </div>
          <Button
            alwaysEnabled
            icon
            className="header__menu"
            look="secondary"
            onClick={onMenuClick}
          >
            <i className="mdi mdi-menu" style={{ fontSize: '20px' }} />
          </Button>
        </div>
        <div className="header__actions">
          {isConnected
            ? (
              <>
                {isDaoPage && <Balance />}
                <WalletDropdown />
              </>
            )
            : <ConnectWallet />
          }
          <Settings />
        </div>
      </div>
    </StyledHeader>
  );
}

export default memo(Header);
