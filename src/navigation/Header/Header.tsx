import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useWeb3Context } from 'context/Web3ContextProvider';

import logo from 'assets/img/logo.png';
import Button from 'components/Button';

import Balance from './components/Balance';
import ConnectWallet from './components/ConnectWallet';
import Network from './components/Network';
import Settings from './components/Settings';
import WalletDropdown from './components/WalletDropdown';
import { StyledHeader } from './styles';

import { useDaoStore } from 'store/dao/hooks';

interface Props {
  onMenuClick: () => void;

}

function Header ({ onMenuClick }: Props) {
  const { t } = useTranslation();
  const { isConnected } = useWeb3Context();
  const { isShowDao, isDaoSupportingToken } = useDaoStore();

  return (
    <StyledHeader isSelectPage={isShowDao}>
      <div className="header__content">
        <div className="header__left">
          <Button
            alwaysEnabled
            icon
            className="header__menu"
            look="secondary"
            onClick={onMenuClick}
          >
            <i className="mdi mdi-menu" style={{ fontSize: '20px' }} />
          </Button>
          <div className="header__network">
            {!isShowDao
              ? <Network />
              : <Link to="/" className="header__logo-wrp">
                <img
                  className="header__logo"
                  alt="Q Logo"
                  src={logo}
                />
                <p className="header__logo-title text-h2">
                  {t('DAO_DASHBOARD')}
                </p>
              </Link>
            }
          </div>
        </div>
        <div className="header__actions">
          {isShowDao &&
            <div className="header__actions-network">
              <Network />
            </div>}
          {isConnected
            ? (
              <>
                {isDaoSupportingToken && <Balance />}
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
