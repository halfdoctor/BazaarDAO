import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent } from '@q-dev/utils';
import { useTheme } from 'styled-components';
import { Proposal } from 'typings/proposals';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalVoting } from './styles';

function ProposalVoting ({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const votingEndTime = useEndTime(new Date(proposal.votingEndTime * 1000));
  const totalVotes = Number(proposal.votesFor) + Number(proposal.votesAgainst);

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
            majority: `>${formatPercent(proposal.requiredMajority)}`
          })}
        </p>

        <Progress
          className="proposal-voting__progress"
          value={Number(proposal.votesFor || 0)}
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
              {formatPercent(proposal.votesFor / totalVotes * 100 || 0)}
            </p>
            <p className="text-md proposal-voting__vote-val">
              {formatNumber(proposal.votesFor)}
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
              {formatPercent(proposal.votesAgainst / totalVotes * 100 || 0)}
            </p>
            <p className="text-md proposal-voting__vote-val">
              {formatNumber(proposal.votesAgainst)}
            </p>
          </div>
        </div>
      </div>
    </StyledProposalVoting>
  );
}

export default ProposalVoting;
