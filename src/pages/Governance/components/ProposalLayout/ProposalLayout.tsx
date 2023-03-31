
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { ProposalStatus } from '@q-dev/q-js-sdk';
import { Tag } from '@q-dev/q-ui-kit';
import { ProposalBaseInfo } from 'typings/proposals';

import PageLayout from 'components/PageLayout';

import ProposalActions from './components/ProposalActions';
import ProposalDetails from './components/ProposalDetails';
import ProposalTurnout from './components/ProposalTurnout';
import ProposalVeto from './components/ProposalVeto';
import ProposalVoting from './components/ProposalVoting';
import { ProposalLayoutContainer } from './styles';

import { getStatusState, statusMap } from 'contracts/helpers/proposals-helper';

function ProposalLayout ({ proposal }: {
  proposal: ProposalBaseInfo;
}) {
  const { t } = useTranslation();
  const status = useMemo(() => {
    return t(statusMap[proposal.votingStatus || ProposalStatus.NONE]);
  }, [proposal]);

  return (
    <PageLayout
      title={`#${proposal.id} ${proposal.relatedVotingSituation}`}
      titleExtra={<Tag state={getStatusState(proposal.votingStatus)}>{status}</Tag>}
      action={<ProposalActions
        proposal={proposal}
        title={proposal.remark}
      />}
    >
      <ProposalLayoutContainer>
        <ProposalDetails proposal={proposal} />

        <div className="proposal-layout__voting">
          <ProposalTurnout proposal={proposal} />
          <ProposalVoting proposal={proposal} />
          <ProposalVeto proposal={proposal} />
        </div>
      </ProposalLayoutContainer>
    </PageLayout>
  );
}

export default ProposalLayout;
