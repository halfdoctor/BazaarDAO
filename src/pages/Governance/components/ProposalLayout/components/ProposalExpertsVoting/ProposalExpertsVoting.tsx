import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber, unixToDate } from '@q-dev/utils';
import { singlePrecision } from 'helpers';
import { useTheme } from 'styled-components';
import { DaoProposalExtendedProposalStats } from 'typings/proposals';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalExpertsVoting } from './styles';

interface Props {
  extendedProposalStats: DaoProposalExtendedProposalStats;
}

function ProposalExpertsVoting ({ extendedProposalStats }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const votingEndTime = useEndTime(unixToDate(extendedProposalStats.voteByExpertEndTime.toString()));

  const totalVotes = useMemo(() => {
    return toBigNumber(extendedProposalStats.counters.expertVoteFor.toString())
      .plus(extendedProposalStats.counters.expertVoteAgainst.toString()).toNumber();
  }, [extendedProposalStats]);

  return (
    <StyledProposalExpertsVoting className="block">
      <div className="block__header">
        <h2 className="text-h2">{t('EXPERTS_VOTING')}</h2>
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
        <p className="proposal-experts-voting__majority text-md">
          {t('MAJORITY_REQUIREMENT', {
            majority: `>${formatPercent(singlePrecision(extendedProposalStats.requiredExpertsMajority.toString()))}`
          })}
        </p>

        <Progress
          className="proposal-experts-voting__progress"
          value={Number(extendedProposalStats.counters.expertVoteFor)}
          max={totalVotes}
          trackColor={colors.errorMain}
          valueColor={colors.successMain}
        />

        <div className="proposal-experts-voting__votes">
          <div className="proposal-experts-voting__vote">
            <div
              className="proposal-experts-voting__vote-bg"
              style={{ backgroundColor: colors.successMain }}
            />
            <p className="text-md">
              {t('YES')}
            </p>
            <p className="text-md proposal-experts-voting__vote-val">
              {formatPercent(
                toBigNumber(extendedProposalStats.counters.expertVoteFor.toString()).div(totalVotes).multipliedBy(100)
              )}
            </p>
            <p className="text-md proposal-experts-voting__vote-val">
              {formatNumber(extendedProposalStats.counters.expertVoteFor.toString())}
            </p>
          </div>

          <div className="proposal-experts-voting__vote">
            <div
              className="proposal-experts-voting__vote-bg"
              style={{ backgroundColor: colors.errorMain }}
            />
            <p className="text-md">
              {t('NO')}
            </p>
            <p className="text-md proposal-experts-voting__vote-val">
              {formatPercent(
                toBigNumber(extendedProposalStats.counters.expertVoteAgainst.toString())
                  .div(totalVotes)
                  .multipliedBy(100)
              )}
            </p>
            <p className="text-md proposal-experts-voting__vote-val">
              {formatNumber(extendedProposalStats.counters.expertVoteAgainst.toString())}
            </p>
          </div>
        </div>
      </div>
    </StyledProposalExpertsVoting>
  );
}

export default ProposalExpertsVoting;
