import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Icon, Progress, Tag, toBigNumber } from '@q-dev/q-ui-kit';
import { formatPercent } from '@q-dev/utils';
import BigNumber from 'bignumber.js';
import { singlePrecision } from 'helpers';
import styled from 'styled-components';
import { ProposalBaseInfo } from 'typings/proposals';

import ProposalCardSkeleton from '../ProposalCardSkeleton';
import VotingPeriods from '../VotingPeriods';

import { useDaoStore } from 'store/dao/hooks';
import { useExpertPanels } from 'store/expert-panels/hooks';

import { getStatusState, statusMap } from 'contracts/helpers/proposals-helper';

import { PROPOSAL_STATUS } from 'constants/statuses';

const ProposalCardLink = styled(Link)`
background-color: ${({ theme }) => theme.colors.backgroundPrimary};
transition: all 150ms ease-out;

&:hover,
&:focus-visible {
  outline: none;
  border-color: ${({ theme }) => theme.colors.borderMain};
}

.proposal-card__head {
  display: flex;
  justify-content: space-between;
}

.proposal-card__id {
  display: flex;
  gap: 8px;
}

.proposal-card__title {
  margin-top: 12px;
}

.proposal-card__voting {
  margin-top: 16px;
}

.proposal-card__quorum {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
}

.proposal-card__progress {
  margin-top: 8px;
}

.proposal-card__periods {
  margin-top: 20px;
}
`;

function ProposalCard ({ proposal }: { proposal: ProposalBaseInfo }) {
  const { t } = useTranslation();
  const { composeDaoLink } = useDaoStore();
  const { availablePanels } = useExpertPanels();
  const isExpertsVotingShow = proposal.isVoteByExpertConfigured &&
    proposal.votingStatus !== PROPOSAL_STATUS.pending;

  const requiredQuorum = isExpertsVotingShow && proposal.expertsVotingStats
    ? proposal.expertsVotingStats.requiredExpertsQuorum.toString()
    : proposal.requiredQuorum.toString();

  const currentQuorum = isExpertsVotingShow && proposal.expertsVotingStats
    ? proposal.expertsVotingStats.currentExpertsQuorum.toString()
    : proposal.currentQuorum.toString();

  const leftQuorum = useMemo(() => {
    return BigNumber.max(
      toBigNumber(requiredQuorum)
        .minus(currentQuorum)
        .integerValue(BigNumber.ROUND_CEIL)
        .toNumber(),
      0).toString();
  }, [proposal]);

  const status = useMemo(() => {
    return t(statusMap[proposal.votingStatus || PROPOSAL_STATUS.none]);
  }, [proposal]);

  const panelNamePosition = useMemo(() => {
    return availablePanels.findIndex((item: string) => item === proposal.relatedExpertPanel);
  }, [proposal]);

  return proposal
    ? (
      <ProposalCardLink
        className="block"
        to={{
          pathname: composeDaoLink(`/governance/proposal/panel-${panelNamePosition}/${proposal.id.toString()}`),
          state: { from: 'list' },
        }}
      >
        <div className="proposal-card__head">
          <p className="proposal-card__id text-md">
            <span className="font-light">{t('PROPOSAL_ID')}</span>
            <span>{proposal.id.toString()}</span>
          </p>

          {proposal.votingStatus &&
            <Tag state={getStatusState(proposal.votingStatus)}>
              {status}
            </Tag>}
        </div>

        <h2
          className="proposal-card__title text-h2 ellipsis"
          title={proposal.relatedVotingSituation}
        >
          {proposal.relatedVotingSituation}
        </h2>

        <div className="proposal-card__voting">
          <div className="proposal-card__quorum">
            <p className="text-md">
              {t('QUORUM', { quorum: formatPercent(singlePrecision(currentQuorum)) })}
            </p>
            <p className="text-md">
              {leftQuorum
                ? t('LEFT_QUORUM', { quorum: formatPercent(singlePrecision(leftQuorum)) })
                : <Icon name="double-check" />
              }
            </p>
          </div>

          <Progress
            className="proposal-card__progress"
            value={Number(singlePrecision(currentQuorum))}
            max={Number(singlePrecision(requiredQuorum))}
          />

          <VotingPeriods
            className="proposal-card__periods"
            proposal={proposal}
          />
        </div>
      </ProposalCardLink>
    )
    : <ProposalCardSkeleton />;
}

export default ProposalCard;
