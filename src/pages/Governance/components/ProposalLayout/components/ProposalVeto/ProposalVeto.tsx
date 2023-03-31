import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent, toBigNumber } from '@q-dev/utils';
import { singlePrecision } from 'helpers/convert';
import { ProposalBaseInfo } from 'typings/proposals';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalVeto } from './styles';

function ProposalVeto ({ proposal }: { proposal: ProposalBaseInfo }) {
  const { t } = useTranslation();

  const vetoEndTime = useMemo(() => {
    return useEndTime(new Date(toBigNumber(proposal.params.vetoEndTime).multipliedBy(1000).toNumber()));
  }, [proposal]);

  const noVoteCount = useMemo(() => {
    return toBigNumber(proposal.vetoMembersCount).minus(proposal.counters.vetoesCount).toNumber();
  }, [proposal]);

  return !proposal.isVetoGroupExists
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
            max={Number(proposal.vetoMembersCount)}
          />

          <div className="proposal-veto__votes">
            <div className="proposal-veto__vote">
              <p className="text-md">{t('OBJECTION')}</p>
              <p className="text-md proposal-veto__vote-val">
                {formatPercent(toBigNumber(proposal.counters.vetoesCount)
                  .div(proposal.vetoMembersCount).multipliedBy(100))}
              </p>
              <p className="text-md proposal-veto__vote-val">
                {formatNumber(proposal.counters.vetoesCount)}
              </p>
            </div>

            <div className="proposal-veto__vote">
              <p className="text-md">{t('DID_NOT_VOTE')}</p>
              <p className="text-md proposal-veto__vote-val">
                {formatPercent(toBigNumber(noVoteCount).div(proposal.vetoMembersCount).multipliedBy(100))}
              </p>
              <p className="text-md proposal-veto__vote-val">
                {formatNumber(noVoteCount)}
              </p>
            </div>
          </div>
        </div>
      </StyledProposalVeto>
    );
}

export default ProposalVeto;
