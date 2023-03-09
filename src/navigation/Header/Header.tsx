import { memo } from 'react';

import { useWeb3Context } from 'context/Web3ContextProvider';

import Button from 'components/Button';

import Balance from './components/Balance';
import ConnectWallet from './components/ConnectWallet';
import Network from './components/Network';
import Settings from './components/Settings';
import WalletDropdown from './components/WalletDropdown';
import { StyledHeader } from './styles';

function Header ({ onMenuClick }: { onMenuClick: () => void }) {
  const { isConnected } = useWeb3Context();

  return (
    <StyledHeader>
      <div className="header__content">
        <div className="header__left">
          <div className="header__network">
            <Network />
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
                <Balance />
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
