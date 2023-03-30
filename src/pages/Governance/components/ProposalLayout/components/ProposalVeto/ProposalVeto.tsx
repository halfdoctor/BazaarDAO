import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import { singlePrecision } from 'helpers/convert';
import { DaoProposal } from 'typings/proposals';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalVeto } from './styles';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function ProposalVeto ({ proposal }: { proposal: DaoProposal }) {
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

  const vetoEndTime = useEndTime(new Date(toBigNumber(proposal.params.vetoEndTime).multipliedBy(1000).toNumber()));
  const noVote = toBigNumber(rootNodesNumber).minus(proposal.counters.vetoesCount).toNumber();

  return hasNoVeto
    ? null
    : (
      <StyledProposalVeto className="block">
        <div className="block__header">
          <h2 className="text-h2">{t('VETO')}</h2>
          <Tooltip
            placement="bottom"
            trigger={(
              <p className="text-md font-light">{vetoEndTime.relative}</p>
            )}
          >
            {vetoEndTime.formatted}
          </Tooltip>
        </div>

        <div className="block__content">
          <p className="text-md">
            {t('THRESHOLD', {
              threshold: formatPercent(singlePrecision(proposal.params.requiredVetoQuorum)),
            })}
          </p>

          <Progress
            className="proposal-veto__progress"
            value={Number(proposal.counters.vetoesCount)}
            max={Number(rootNodesNumber)}
          />

          <div className="proposal-veto__votes">
            <div className="proposal-veto__vote">
              <p className="text-md">{t('OBJECTION')}</p>
              <p className="text-md proposal-veto__vote-val">
                {formatPercent(toBigNumber(proposal.counters.vetoesCount).div(rootNodesNumber).multipliedBy(100))}
              </p>
              <p className="text-md proposal-veto__vote-val">
                {formatNumber(proposal.counters.vetoesCount)}
              </p>
            </div>

            <div className="proposal-veto__vote">
              <p className="text-md">{t('DID_NOT_VOTE')}</p>
              <p className="text-md proposal-veto__vote-val">
                {formatPercent(toBigNumber(noVote).div(rootNodesNumber).multipliedBy(100))}
              </p>
              <p className="text-md proposal-veto__vote-val">
                {formatNumber(noVote)}
              </p>
            </div>
          </div>
        </div>
      </StyledProposalVeto>
    );
}

export default ProposalVeto;
