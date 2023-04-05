import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { VotingType } from '@q-dev/gdk-sdk';
import { Icon, Progress } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import BigNumber from 'bignumber.js';
import { ProposalBaseInfo } from 'typings/proposals';

import { StyledProposalTurnout } from './styles';

import { useDaoStore } from 'store/dao/hooks';

import { fromWeiWithDecimals } from 'utils/numbers';
import { singlePrecision } from 'utils/web3';

function ProposalTurnout ({ proposal, }: { proposal: ProposalBaseInfo }) {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoStore();

  const leftQuorum = useMemo(() => {
    return BigNumber.max(
      toBigNumber(proposal.requiredQuorum)
        .minus(proposal.currentQuorum)
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber(), 0).toString();
  }, [proposal]);

  const totalVotes = useMemo(() => {
    return toBigNumber(proposal.counters.votedFor).plus(proposal.counters.votedAgainst).toString();
  }, [proposal]);

  const noVoteValue = useMemo(() => {
    return proposal.params.votingType.toString() === VotingType.Restricted
      ? toBigNumber(proposal.totalVoteValue).minus(proposal.vetoMembersCount)
      : toBigNumber(proposal.totalVoteValue).minus(totalVotes);
  }, []);

  return (
    <StyledProposalTurnout className="block">
      <h2 className="text-h2">{t('TURNOUT')}</h2>

      <div className="block__content">
        <div className="proposal-turnout__quorum">
          <p className="text-md">
            {t('QUORUM', { quorum: formatPercent(singlePrecision(proposal.currentQuorum)) })}
          </p>
          <p className="text-md">
            {leftQuorum
              ? t('LEFT_QUORUM', { quorum: formatPercent(singlePrecision(leftQuorum)) })
              : <Icon name="double-check" />
            }
          </p>
        </div>

        <Progress
          className="proposal-turnout__progress"
          value={Number(proposal.currentQuorum)}
          max={Number(proposal.requiredQuorum)}
        />

        <div className="proposal-turnout__votes">
          <div className="proposal-turnout__vote">
            <p className="text-md color-secondary">{t('VOTED')}</p>
            <p className="text-md proposal-turnout__votes-val">
              {formatNumber(fromWeiWithDecimals(totalVotes, tokenInfo.decimals))}
            </p>
          </div>

          <div className="proposal-turnout__vote">
            <p className="text-md color-secondary">{t('DID_NOT_VOTE')}</p>
            <p className="text-md proposal-turnout__votes-val">
              {formatNumber(fromWeiWithDecimals(noVoteValue.toString(), tokenInfo.decimals))}
            </p>
          </div>
        </div>
      </div>
    </StyledProposalTurnout>
  );
}

export default ProposalTurnout;
