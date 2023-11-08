import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon, Progress } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import BigNumber from 'bignumber.js';
import { singlePrecision } from 'helpers';
import { DaoProposalExtendedProposalStats, DaoProposalExtendedVotingStats } from 'typings/proposals';

import { StyledProposalExpertsTurnout } from './styles';

interface Props {
  expertsVotingStats: DaoProposalExtendedVotingStats;
  extendedProposalStats: DaoProposalExtendedProposalStats;
  membersCount: string;
}

function ProposalExpertsTurnout ({ expertsVotingStats, extendedProposalStats, membersCount }: Props) {
  const { t } = useTranslation();

  const leftQuorum = useMemo(() => {
    return BigNumber.max(
      toBigNumber(expertsVotingStats.requiredExpertsQuorum.toString())
        .minus(expertsVotingStats.currentExpertsQuorum.toString())
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber(), 0).toString();
  }, [expertsVotingStats]);

  const totalVotes = useMemo(() => {
    return toBigNumber(extendedProposalStats.counters.expertVoteFor.toString())
      .plus(extendedProposalStats.counters.expertVoteAgainst.toString()).toString();
  }, [extendedProposalStats]);

  const noVoteValue = useMemo(() => {
    return toBigNumber(membersCount)
      .minus(totalVotes)
      .toString();
  }, [membersCount, totalVotes]);

  return (
    <StyledProposalExpertsTurnout className="block">
      <h2 className="text-h2">{t('EXPERTS_TURNOUT')}</h2>

      <div className="block__content">
        <div className="proposal-experts-turnout__quorum">
          <p className="text-md">
            {t('QUORUM', { quorum: formatPercent(singlePrecision(expertsVotingStats.currentExpertsQuorum.toString())) })}
          </p>
          <p className="text-md">
            {leftQuorum
              ? t('LEFT_QUORUM', { quorum: formatPercent(singlePrecision(leftQuorum)) })
              : <Icon name="double-check" />
            }
          </p>
        </div>

        <Progress
          className="proposal-experts-turnout__progress"
          value={Number(expertsVotingStats.currentExpertsQuorum)}
          max={Number(expertsVotingStats.requiredExpertsQuorum)}
        />

        <div className="proposal-experts-turnout__votes">
          <div className="proposal-experts-turnout__vote">
            <p className="text-md color-secondary">{t('VOTED')}</p>
            <p className="text-md proposal-experts-turnout__votes-val">
              {formatNumber(totalVotes)}
            </p>
          </div>

          <div className="proposal-experts-turnout__vote">
            <p className="text-md color-secondary">{t('DID_NOT_VOTE')}</p>
            <p className="text-md proposal-experts-turnout__votes-val">
              {formatNumber(noVoteValue)}
            </p>
          </div>
        </div>
      </div>
    </StyledProposalExpertsTurnout>
  );
}

export default ProposalExpertsTurnout;
