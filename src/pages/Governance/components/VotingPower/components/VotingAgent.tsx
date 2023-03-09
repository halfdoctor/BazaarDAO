import { useTranslation } from 'react-i18next';

import { Icon, media, Tag } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import Button from 'components/Button';
import ExplorerAddress from 'components/Custom/ExplorerAddress';

import { useQVault } from 'store/q-vault/hooks';
import { useTransaction } from 'store/transaction/hooks';
import { useUser } from 'store/user/hooks';

import { ZERO_ADDRESS } from 'constants/boundaries';
import { formatDateRelative, unixToDate } from 'utils/date';

const StyledWrapper = styled.div`
  .voting-agent-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;

    ${media.lessThan('medium')} {
      flex-wrap: wrap;
      gap: 16px;
    }
  }

  .voting-agent-status {
    display: flex;
    gap: 8px;
  }
`;

function VotingAgent ({ disabled }: { disabled: boolean }) {
  const { t, i18n } = useTranslation();
  const { submitTransaction } = useTransaction();

  const { delegationInfo, setNewVotingAgent, announceNewVotingAgent } = useQVault();
  const { votingAgent, isPending, votingAgentPassOverTime } = delegationInfo;
  const user = useUser();

  const isUserAgent = votingAgent === user.address || votingAgent === ZERO_ADDRESS;
  const canConfirmAgent = Date.now() > unixToDate(votingAgentPassOverTime).getTime();

  return (
    <StyledWrapper>
      <p className="text-md color-secondary">{t('CURRENT_AGENT')}</p>
      <div className="text-xl font-semibold voting-agent-value">
        <div className="voting-agent-status">
          {votingAgent
            ? isUserAgent
              ? t('NO_AGENT')
              : (
                <ExplorerAddress
                  short
                  semibold
                  iconed
                  address={votingAgent}
                />
              )
            : '...'
          }

          {isPending && <Tag state="pending">{t('PENDING')}</Tag>}
        </div>

        {isPending && (
          <Button
            compact
            disabled={!canConfirmAgent}
            onClick={() => submitTransaction({
              successMessage: t('DELEGATE_VOTING_POWER_TX'),
              submitFn: setNewVotingAgent
            })}
          >
            <Icon name="check-circle" />
            <span>{t('CONFIRM')}</span>
            {!canConfirmAgent && (
              <span>{formatDateRelative(unixToDate(votingAgentPassOverTime), i18n.language)}</span>
            )}
          </Button>
        )}

        {!isPending && !isUserAgent && (
          <Button
            compact
            disabled={disabled}
            look="danger"
            onClick={() => submitTransaction({
              successMessage: t('ANNOUNCE_NEW_VOTING_AGENT_TX'),
              submitFn: () => announceNewVotingAgent(user.address)
            })}
          >
            {t('REMOVE')}
          </Button>
        )}
      </div>
    </StyledWrapper>
  );
}

export default VotingAgent;
