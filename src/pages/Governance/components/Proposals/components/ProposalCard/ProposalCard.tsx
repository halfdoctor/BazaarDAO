import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ProposalStatus } from '@q-dev/q-js-sdk';
import { Icon, Progress, Tag, toBigNumber } from '@q-dev/q-ui-kit';
import { formatPercent } from '@q-dev/utils';
import BigNumber from 'bignumber.js';
import { singlePrecision } from 'helpers/convert';
import { DaoProposal, DaoProposalVotingInfo } from 'typings/proposals';

import useDao from 'hooks/useDao';

import ProposalCardSkeleton from '../ProposalCardSkeleton';
import VotingPeriods from '../VotingPeriods';

import { ProposalCardLink } from './styles';

import { useDaoProposals } from 'store/dao-proposals/hooks';

function ProposalCard ({ proposal, panelName }: { proposal: DaoProposal; panelName: string }) {
  const { t } = useTranslation();
  const { composeDaoLink } = useDao();
  const { getProposalInfo, statusMap, getStatusState, panelsName } = useDaoProposals();
  const [proposalInfo, setProposalInfo] = useState<DaoProposalVotingInfo | null>(null);

  const leftQuorum = useMemo(() => {
    return proposalInfo
      ? toBigNumber(proposalInfo?.requiredQuorum)
        .minus(proposalInfo?.currentQuorum)
        .integerValue(BigNumber.ROUND_CEIL)
        .toString()
      : 0;
  }, [proposalInfo]);

  const status = useMemo(() => {
    return statusMap[proposalInfo?.votingStatus || ProposalStatus.NONE];
  }, [proposalInfo]);

  const panelNamePosition = useMemo(() => {
    return panelsName.findIndex(item => item === proposal.relatedExpertPanel);
  }, [proposal]);

  const init = useCallback(async () => {
    if (proposal.id) {
      const response = await getProposalInfo(proposal.id, panelName);
      setProposalInfo(response as DaoProposalVotingInfo);
    }
  }, [proposal]);

  useEffect(() => {
    init();
    return () => {
      setProposalInfo(null);
    };
  }, []);

  return proposalInfo && proposal
    ? (
      <ProposalCardLink
        className="block"
        to={{
          pathname: composeDaoLink(`/governance/proposal/panels-${panelNamePosition}/${proposal.id}`),
          state: { from: 'list' },
        }}
      >
        <div className="proposal-card__head">
          <p className="proposal-card__id text-md">
            <span className="font-light">{t('PROPOSAL_ID')}</span>
            <span>{proposal.id}</span>
          </p>

          {proposalInfo.votingStatus &&
            <Tag state={getStatusState(proposalInfo.votingStatus)}>
              {status}
            </Tag>}
        </div>

        <h2
          className="proposal-card__title text-h2 ellipsis"
          title={proposal.remark}
        >
          {proposal.remark}
        </h2>

        <div className="proposal-card__voting">
          <div className="proposal-card__quorum">
            <p className="text-md">
              {t('QUORUM', { quorum: formatPercent(singlePrecision(proposalInfo.currentQuorum)) })}
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
            value={Number(singlePrecision(proposalInfo.currentQuorum))}
            max={Number(singlePrecision(proposalInfo.requiredQuorum))}
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
