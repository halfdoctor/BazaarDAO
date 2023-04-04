import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber, unixToDate } from '@q-dev/utils';
import { useTheme } from 'styled-components';
import { ProposalBaseInfo } from 'typings/proposals';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalVoting } from './styles';

import { useDaoStore } from 'store/dao/hooks';

import { fromWeiWithDecimals } from 'utils/numbers';
import { singlePrecision } from 'utils/web3';

function ProposalVoting ({ proposal }: { proposal: ProposalBaseInfo }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { tokenInfo } = useDaoStore();

  const votingEndTime = useEndTime(unixToDate(proposal.params.votingEndTime));

  const totalVotes = useMemo(() => {
    return toBigNumber(
      proposal.counters.votedFor).plus(proposal.counters.votedAgainst).toNumber();
  }, [proposal]);

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
          value={Number(proposal.counters.votedFor)}
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
              {formatNumber(fromWeiWithDecimals(proposal.counters.votedFor, tokenInfo.decimals))}
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
              {formatNumber(fromWeiWithDecimals(proposal.counters.votedAgainst, tokenInfo.decimals))}
            </p>
          </div>
        </div>
      </div>
    </StyledProposalVoting>
  );
}

export default ProposalVoting;
