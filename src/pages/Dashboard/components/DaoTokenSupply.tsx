import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Dropdown, Icon, Modal } from '@q-dev/q-ui-kit';
import { formatNumberCompact } from '@q-dev/utils';
import { useWeb3Context } from 'context/Web3ContextProvider';
import styled from 'styled-components';

import ExplorerAddress from 'components/Custom/ExplorerAddress';

import MintForm from './components/MintForm';

import { useDaoStore } from 'store/dao/hooks';

import { captureError } from 'utils/errors';
import { fromWeiWithDecimals } from 'utils/numbers';

const StyledWrapper = styled.div`
  padding: 16px 16px 16px 24px;

  .dao-token-supply__menu {
    background-color: ${({ theme }) => theme.colors.backgroundPrimary};
    display: grid;
    width: max-content;
    min-width: 156px;
    padding: 4px 0;
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colors.borderSecondary};
    box-shadow:
      0 4px 4px ${({ theme }) => theme.colors.blockShadowDark},
      0 -1px 2px ${({ theme }) => theme.colors.blockShadowLight};
  }

  .dao-token-supply__menu-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  .dao-token-supply__menu-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    transition: background-color 100ms ease-out;
    background-color: transparent;
    border: none;
    color: ${({ theme }) => theme.colors.textPrimary};

    &:hover {
      background-color: ${({ theme }) => theme.colors.tertiaryLight};
    }
  }

  .dao-token-supply__menu-icon {
    width: 20px;
    height: auto;
  }

  .dao-token-supply__val {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 4px;
  }

  .dao-token-supply__contract {
    margin-top: 16px;
    display: flex;
    gap: 4px;
  }
`;

function DaoTokenSupply () {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentProvider } = useWeb3Context();

  // TODO: Add in separate func
  async function addTokenToWallet () { // to Provider
    if (!window?.ethereum) return;
    try {
      // await window.ethereum.request({
      //   method: 'wallet_watchAsset',
      //   params: {
      //     type: 'ERC20',
      //     options: {
      //       address: tokenInfo.address,
      //       symbol: tokenInfo.symbol,
      //       decimals: tokenInfo.decimals,
      //     },
      //   },
      // });
    } catch (error) {
      captureError(error);
    }
  }

  return (
    <StyledWrapper className="block">
      <div className="block__header">
        <h2 className="text-lg">{t('DAO_TOKEN_SUPPLY')}</h2>

        <Dropdown
          right
          open={isMenuOpen}
          trigger={(
            <Button
              icon
              className="dao-token-supply__menu-btn"
              look="ghost"
              active={isMenuOpen}
            >
              <Icon name="more-vertical" />
            </Button>
          )}
          onToggle={setIsMenuOpen}
        >
          <div className="dao-token-supply__menu">
            <button
              className="dao-token-supply__menu-item text-md"
              onClick={addTokenToWallet}
            >
              <img
                className="dao-token-supply__menu-icon"
                src="/icons/metamask.svg"
                alt="metamask"
              />
              <span>{t('ADD_TO_WALLET')}</span>
            </button>
            {tokenInfo.owner === currentProvider?.selectedAddress && (
              <button
                className="dao-token-supply__menu-item text-md"
                onClick={() => setIsModalOpen(true)}
              >
                <Icon name="coins" />
                {t('MINT_TOKENS')}
              </button>
            )}
          </div>
        </Dropdown>
      </div>

      <div className="dao-token-supply__val">
        <p className="text-xl font-semibold" title={fromWeiWithDecimals(tokenInfo.totalSupply, tokenInfo.decimals)}>
          {formatNumberCompact(fromWeiWithDecimals(tokenInfo.totalSupply, tokenInfo.decimals))}
        </p>
        <p className="text-xl font-semibold">{tokenInfo.symbol}</p>
      </div>

      <div className="dao-token-supply__contract text-sm">
        <span className="font-light">{t('CONTRACT')}</span>
        <ExplorerAddress short address={tokenInfo.address} />
      </div>

      <Modal
        open={isModalOpen}
        title={t('MINT')}
        onClose={() => setIsModalOpen(false)}
      >
        <MintForm onSubmit={() => setIsModalOpen(false)} />
      </Modal>
    </StyledWrapper>
  );
}

export default DaoTokenSupply;