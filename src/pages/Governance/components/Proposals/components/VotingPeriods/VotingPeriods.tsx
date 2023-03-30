import { HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@q-dev/q-ui-kit';
import { toBigNumber } from '@q-dev/utils';
import { DaoProposal } from 'typings/proposals';

import { VotingContainer } from './styles';

import { useDaoProposals } from 'store/dao-proposals/hooks';

import { formatDate, formatDateRelative } from 'utils/date';

interface Props extends HTMLAttributes<HTMLDivElement> {
  proposal: DaoProposal;
}

function VotingPeriods ({ proposal, ...rest }: Props) {
  const { t, i18n } = useTranslation();
  const { getProposalVetoInfo } = useDaoProposals();
  const [hasNoVeto, setHasNoVeto] = useState(false);

  const loadVetoInfo = useCallback(async () => {
    const vetoInfo = await getProposalVetoInfo(proposal.target);
    setHasNoVeto(Boolean(vetoInfo?.isVetoGroupExists));
  }, []);

  const votingEndTime = new Date(toBigNumber(proposal.params.votingEndTime).multipliedBy(1000).toNumber()).getTime();
  const vetoEndTime = new Date(toBigNumber(proposal.params.vetoEndTime).multipliedBy(1000).toNumber()).getTime();

  const votingText = votingEndTime > Date.now()
    ? t('VOTING_ENDS')
    : t('VOTING_ENDED');
  const vetoText = vetoEndTime > Date.now()
    ? t('VETO_ENDS')
    : t('VETO_ENDED');

  useEffect(() => {
    loadVetoInfo();
  }, []);

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
