import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon, Progress } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import BigNumber from 'bignumber.js';
import { singlePrecision } from 'helpers/convert';
import { ProposalBaseInfo } from 'typings/proposals';
import { fromWei } from 'web3-utils';

import { StyledProposalTurnout } from './styles';

function ProposalTurnout ({ proposal, }: { proposal: ProposalBaseInfo }) {
  const { t } = useTranslation();

  const leftQuorum = useMemo(() => {
    return Math.max(
      toBigNumber(proposal.requiredQuorum)
        .minus(proposal.currentQuorum)
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber(), 0);
  }, [proposal]);

  const totalVotes = useMemo(() => {
    return toBigNumber(proposal.counters.votedFor).plus(proposal.counters.votedAgainst).toString();
  }, [proposal]);

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
              {formatNumber(fromWei(totalVotes))}
            </p>
          </div>

          <div className="proposal-turnout__vote">
            <p className="text-md color-secondary">{t('DID_NOT_VOTE')}</p>
            <p className="text-md proposal-turnout__votes-val">
              {!proposal.isVetoGroupExists
                ? formatNumber(toBigNumber(proposal.vetoMembersCount).minus(totalVotes))
                : '–'
              }
            </p>
          </div>
        </div>
      </div>
    </StyledProposalTurnout>
  );
}

export default ProposalTurnout;
