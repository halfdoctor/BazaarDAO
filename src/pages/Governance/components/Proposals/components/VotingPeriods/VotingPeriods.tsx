import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { ProposalStatus } from '@q-dev/q-js-sdk';
import { Tooltip } from '@q-dev/q-ui-kit';
import { Proposal } from 'typings/proposals';

import { VotingContainer } from './styles';

import { CONTRACTS_NAMES } from 'constants/contracts';
import { formatDate, formatDateRelative } from 'utils/date';

interface Props extends HTMLAttributes<HTMLDivElement> {
  proposal: Proposal;
}

function VotingPeriods ({ proposal, ...rest }: Props) {
  const { t, i18n } = useTranslation();

  const hasNoVeto = [
    CONTRACTS_NAMES.emergencyUpdateVoting,
  ].includes(proposal.contract);

  const votingEndTime = new Date(proposal.votingEndTime * 1000).getTime();
  const vetoEndTime = proposal.status === ProposalStatus.REJECTED
    ? 0
    : new Date(proposal.vetoEndTime * 1000).getTime();

  const votingText = votingEndTime > Date.now()
    ? t('VOTING_ENDS')
    : t('VOTING_ENDED');
  const vetoText = vetoEndTime > Date.now()
    ? t('VETO_ENDS')
    : t('VETO_ENDED');

  return (
    <VotingContainer {...rest}>
      <Tooltip
        placement="bottom"
        trigger={(
          <p className="text-md font-light">
            {`${votingText} ${formatDateRelative(votingEndTime, i18n.language)}`}
          </p>
        )}
      >
        {formatDate(votingEndTime, i18n.language)}
      </Tooltip>

      <Tooltip
        placement="bottom"
        disabled={hasNoVeto || !vetoEndTime}
        trigger={(
          <p className="text-md font-light">
            {hasNoVeto || !vetoEndTime
              ? t('NO_VETO')
              : `${vetoText} ${formatDateRelative(vetoEndTime, i18n.language)}`
            }
          </p>
        )}
      >
        {formatDate(vetoEndTime, i18n.language)}
      </Tooltip>
    </VotingContainer>
  );
}

export default VotingPeriods;
