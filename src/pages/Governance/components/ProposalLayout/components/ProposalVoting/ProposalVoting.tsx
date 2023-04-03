import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import { useTheme } from 'styled-components';
import { DaoProposal } from 'typings/proposals';
import { fromWei } from 'web3-utils';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalVoting } from './styles';

import { singlePrecision } from 'utils/web3';

function ProposalVoting ({ proposal }: { proposal: DaoProposal }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const votingEndTime = useEndTime(
    new Date(toBigNumber(proposal.params.votingEndTime).multipliedBy(1000).toNumber())
  );

  const totalVotes = useMemo(() => toBigNumber(
    proposal.counters.votedFor).plus(proposal.counters.votedAgainst).toNumber(), [proposal]);

  return (
    <StyledProposalVoting className="block">
      <div className="block__header">
        <h2 className="text-h2">{t('VOTING')}</h2>
        <Tooltip
          placement="bottom"
          trigger={(
            <p className="text-md font-light">{votingEndTime.relative}</p>
          )}
        >
          {votingEndTime.formatted}
        </Tooltip>
      </div>

      <div className="block__content">
        <p className="proposal-voting__majority text-md">
          {t('MAJORITY_REQUIREMENT', {
            majority: `>${formatPercent(singlePrecision(proposal.params.requiredMajority))}`
          })}
        </p>

        <Progress
          className="proposal-voting__progress"
          value={Number(proposal.counters.votedFor || 0)}
          max={totalVotes}
          trackColor={colors.errorMain}
          valueColor={colors.successMain}
        />

        <div className="proposal-voting__votes">
          <div className="proposal-voting__vote">
            <div
              className="proposal-voting__vote-bg"
              style={{ backgroundColor: colors.successMain }}
            />
            <p className="text-md">
              {t('YES')}
            </p>
            <p className="text-md proposal-voting__vote-val">
              {formatPercent(toBigNumber(proposal.counters.votedFor).div(totalVotes).multipliedBy(100))}
            </p>
            <p className="text-md proposal-voting__vote-val">
              {formatNumber(fromWei(proposal.counters.votedFor))}
            </p>
          </div>

          <div className="proposal-voting__vote">
            <div
              className="proposal-voting__vote-bg"
              style={{ backgroundColor: colors.errorMain }}
            />
            <p className="text-md">
              {t('NO')}
            </p>
            <p className="text-md proposal-voting__vote-val">
              {formatPercent(toBigNumber(proposal.counters.votedAgainst).div(totalVotes).multipliedBy(100))}
            </p>
            <p className="text-md proposal-voting__vote-val">
              {formatNumber(fromWei(proposal.counters.votedAgainst))}
            </p>
          </div>
        </div>
      </div>
    </StyledProposalVoting>
  );
}

export default ProposalVoting;
