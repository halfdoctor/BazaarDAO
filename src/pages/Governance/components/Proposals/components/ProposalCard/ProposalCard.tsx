import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon, Progress, Tag } from '@q-dev/q-ui-kit';
import { formatPercent } from '@q-dev/utils';
import { ProposalEvent } from 'typings/contracts';
import { Proposal } from 'typings/proposals';

import useProposalDetails from 'pages/Governance/hooks/useProposalDetails';

import ProposalCardSkeleton from '../ProposalCardSkeleton';
import VotingPeriods from '../VotingPeriods';

import { ProposalCardLink } from './styles';

import { getProposal } from 'contracts/helpers/voting';

function ProposalCard ({ proposal }: { proposal: ProposalEvent }) {
  const { t } = useTranslation();

  const [proposalInfo, setProposalInfo] = useState<Proposal | null>(null);
  const { title, status, state } = useProposalDetails(proposalInfo);

  useEffect(() => {
    loadProposal();

    return () => {
      setProposalInfo(null);
    };
  }, []);

  async function loadProposal () {
    const result = await getProposal(proposal.contract, proposal.id);
    setProposalInfo(result);
  }

  const leftQuorum = Math.max(
    Number(proposalInfo?.requiredQuorum) - Number(proposalInfo?.currentQuorum),
    0
  );

  return proposalInfo
    ? (
      <ProposalCardLink
        className="block"
        to={{
          pathname: `/governance/proposal/${proposal.contract}/${proposal.id}`,
          state: { from: 'list' },
        }}
      >
        <div className="proposal-card__head">
          <p className="proposal-card__id text-md">
            <span className="font-light">{t('PROPOSAL_ID')}</span>
            <span>{proposal.id}</span>
          </p>

          {proposalInfo.status && <Tag state={state}>{status}</Tag>}
        </div>

        <h2
          className="proposal-card__title text-h2 ellipsis"
          title={title}
        >
          {title}
        </h2>

        <div className="proposal-card__voting">
          <div className="proposal-card__quorum">
            <p className="text-md">
              {t('QUORUM', { quorum: formatPercent(proposalInfo.currentQuorum) })}
            </p>
            <p className="text-md">
              {leftQuorum
                ? t('LEFT_QUORUM', { quorum: formatPercent(leftQuorum) })
                : <Icon name="double-check" />
              }
            </p>
          </div>

          <Progress
            className="proposal-card__progress"
            value={Number(proposalInfo.currentQuorum)}
            max={Number(proposalInfo.requiredQuorum)}
          />

          <VotingPeriods
            className="proposal-card__periods"
            proposal={proposalInfo}
          />
        </div>
      </ProposalCardLink>
    )
    : <ProposalCardSkeleton />;
}

export default ProposalCard;
