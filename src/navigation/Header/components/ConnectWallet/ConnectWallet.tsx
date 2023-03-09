import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@q-dev/q-ui-kit';

import Button from 'components/Button';

import ConnectWalletModal from './components/ConnectWalletModal';

function ConnectWallet () {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  function handleClose () {
    setModalOpen(false);
  }

  function handleOpen () {
    setModalOpen(true);
  }

  return (
    <>
      <Button
        alwaysEnabled
        onClick={handleOpen}
      >
        <Icon name="wallet" />
        <span>{t('CONNECT_WALLET')}</span>
      </Button>

      <ConnectWalletModal modalOpen={modalOpen} onModalClose={handleClose} />
    </>
  );
}

export default ConnectWallet;
