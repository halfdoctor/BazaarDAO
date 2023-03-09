import { useTranslation } from 'react-i18next';

import { Progress, Tooltip } from '@q-dev/q-ui-kit';
import { formatNumber, formatPercent } from '@q-dev/utils';
import { Proposal } from 'typings/proposals';

import useEndTime from '../../hooks/useEndTime';

import { StyledProposalVeto } from './styles';

import { CONTRACTS_NAMES } from 'constants/contracts';

function ProposalVeto ({ proposal }: { proposal: Proposal }) {
  const { t } = useTranslation();

  const hasNoVeto = [
    CONTRACTS_NAMES.emergencyUpdateVoting,
  ].includes(proposal.contract);

  const vetoEndTime = useEndTime(new Date(proposal.vetoEndTime * 1000));
  const noVote = proposal.rootNodesNumber - proposal.vetoesNumber;

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
              threshold: formatPercent(proposal.vetoThreshold),
            })}
          </p>

          <Progress
            className="proposal-veto__progress"
            value={proposal.vetoesNumber}
            max={proposal.rootNodesNumber}
          />

          <div className="proposal-veto__votes">
            <div className="proposal-veto__vote">
              <p className="text-md">{t('OBJECTION')}</p>
              <p className="text-md proposal-veto__vote-val">
                {formatPercent(proposal.vetoesNumber / proposal.rootNodesNumber * 100)}
              </p>
              <p className="text-md proposal-veto__vote-val">
                {formatNumber(proposal.vetoesNumber)}
              </p>
            </div>

            <div className="proposal-veto__vote">
              <p className="text-md">{t('DID_NOT_VOTE')}</p>
              <p className="text-md proposal-veto__vote-val">
                {formatPercent(noVote / proposal.rootNodesNumber * 100)}
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
