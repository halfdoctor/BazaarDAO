import { useTranslation } from 'react-i18next';

import { useWeb3Context } from 'context/Web3ContextProvider';
import styled from 'styled-components';

import Button from 'components/Button';
import ConnectWallet from 'navigation/Header/components/ConnectWallet';

export const StyledWrapper = styled.div`
  position: fixed;
  z-index: 10000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max-content;
  max-width: 375px;
  padding: 32px;
  pointer-events: all;

  .network-warning__message {
    margin-top: 20px;
  }

  .network-warning__button {
    margin-top: 24px;
    width: 100%;
  }

  .network-warning__actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 24px;
    width: 100%;
  }
`;

function NetworkWarning () {
  const { t } = useTranslation();
  const { switchNetwork, isConnected } = useWeb3Context();

  if (!isConnected) {
    return (
      <StyledWrapper className="block">
        <p className="text-xl font-semibold">
          {t('NETWORK_NOT_CONNECT_HEADER')}
        </p>
        <p className="network-warning__message text-md color-secondary">
          {t('NETWORK_NOT_CONNECT_MESSAGE')}
        </p>
        <div className="network-warning__actions">
          <ConnectWallet />
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper className="block">
      <p className="text-xl font-semibold">
        {t('NETWORK_WARNING_HEADER')}
      </p>
      <p className="network-warning__message text-md color-secondary">
        {t('NETWORK_WARNING_MESSAGE')}
      </p>
      <Button
        alwaysEnabled
        className="network-warning__button"
        onClick={() => switchNetwork()}
      >
        {t('SWITCH_TO_Q')}
      </Button>
    </StyledWrapper>
  );
}

export default NetworkWarning;
