import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import Button from 'components/Button';

import TopUpForm from './TopUpForm';

const StyledWrapper = styled.div`
  display: inline-flex;
  margin-left: 8px;

  .top-up-btn {
    height: 24px;
    border-radius: 8px;
  }
`;

interface Props {
  onSubmit?: () => void;
}

function TopUpQVault ({ onSubmit = () => {} }: Props) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = () => {
    setModalOpen(false);
    onSubmit();
  };

  return (
    <StyledWrapper>
      <Button
        compact
        icon
        look="secondary"
        className="top-up-btn"
        onClick={() => setModalOpen(true)}
      >
        + {t('TOP_UP')}
      </Button>

      <Modal
        open={modalOpen}
        title={t('TOP_UP_Q_VAULT')}
        tip={t('TOP_UP_MODAL_HINT')}
        onClose={() => setModalOpen(false)}
      >
        <TopUpForm onSubmit={handleSubmit} />
      </Modal>
    </StyledWrapper>
  );
}

export default TopUpQVault;
