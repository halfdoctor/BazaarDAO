import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon, Progress } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import BigNumber from 'bignumber.js';
import { singlePrecision } from 'helpers/convert';
import { DaoProposal, DaoProposalVotingInfo } from 'typings/proposals';

import { StyledProposalTurnout } from './styles';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function ProposalTurnout ({ proposal, proposalInfo }: { proposal: DaoProposal; proposalInfo: DaoProposalVotingInfo }) {
  const { t } = useTranslation();

  const { getProposalVetoInfo } = useDaoProposals();
  const [hasNoVeto, setHasNoVeto] = useState(false);
  const [rootNodesNumber, setRootNodesNumber] = useState('');

  const loadVetoInfo = useCallback(async () => {
    const vetoInfo = await getProposalVetoInfo(proposal.target);
    setRootNodesNumber(vetoInfo?.vetoMembersCount || '');
    setHasNoVeto(Boolean(vetoInfo?.isVetoGroupExists));
  }, []);

  useEffect(() => {
    loadVetoInfo();
  }, []);

  const leftQuorum = useMemo(() => {
    return proposalInfo
      ? toBigNumber(proposalInfo?.requiredQuorum)
        .minus(proposalInfo?.currentQuorum)
        .integerValue(BigNumber.ROUND_CEIL)
        .toString()
      : 0;
  }, [proposalInfo]);
  const totalVotes = toBigNumber(proposal.counters.votedFor).plus(proposal.counters.votedAgainst).toString();

  return (
    <StyledProposalTurnout className="block">
      <h2 className="text-h2">{t('TURNOUT')}</h2>

      <div className="block__content">
        <div className="proposal-turnout__quorum">
          <p className="text-md">
            {t('QUORUM', { quorum: formatPercent(singlePrecision(proposalInfo.currentQuorum)) })}
          </p>
          <p className="text-md">
            {leftQuorum || Number(proposalInfo.currentQuorum) === 0
              ? t('LEFT_QUORUM', { quorum: formatPercent(singlePrecision(leftQuorum)) })
              : <Icon name="double-check" />
            }
          </p>
        </div>

        <Progress
          className="proposal-turnout__progress"
          value={Number(proposalInfo.currentQuorum)}
          max={Number(proposalInfo.requiredQuorum)}
        />

        <div className="proposal-turnout__votes">
          <div className="proposal-turnout__vote">
            <p className="text-md color-secondary">{t('VOTED')}</p>
            <p className="text-md proposal-turnout__votes-val">
              {formatNumber(totalVotes)}
            </p>
          </div>

          <div className="proposal-turnout__vote">
            <p className="text-md color-secondary">{t('DID_NOT_VOTE')}</p>
            <p className="text-md proposal-turnout__votes-val">
              {hasNoVeto
                ? formatNumber(toBigNumber(rootNodesNumber).minus(totalVotes))
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
