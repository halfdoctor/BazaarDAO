
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations, getDecodeData, getDecodeDataByABI } from '@q-dev/gdk-sdk';
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

import { ABI_NAME_BY_SITUATION_MAP } from 'constants/proposal';
import { PROPOSAL_STATUS } from 'constants/statuses';

interface Props {
  proposal: ProposalBaseInfo;
  externalAbi?: string[];
  isExternalProposalSituation: boolean;
}

function ProposalLayout ({ proposal, externalAbi, isExternalProposalSituation }: Props) {
  const { t } = useTranslation();
  const status = useMemo(() => {
    return t(statusMap[proposal.votingStatus || PROPOSAL_STATUS.none]);
  }, [proposal.votingStatus, t]);

  const decodedCallData = useMemo(() => {
    const abiName = ABI_NAME_BY_SITUATION_MAP[proposal.relatedVotingSituation as DefaultVotingSituations];
    if (!abiName && !externalAbi?.length) return null;
    try {
      return abiName
        ? getDecodeData(abiName, proposal.callData) || null
        : getDecodeDataByABI(externalAbi, proposal.callData) || null;
    } catch (_) {
      return null;
    }
  }, [proposal.callData, proposal.relatedVotingSituation, externalAbi]);

  return (
    <PageLayout
      title={`#${proposal.id} ${proposal.relatedVotingSituation}`}
      titleExtra={<Tag state={getStatusState(proposal.votingStatus)}>{status}</Tag>}
      action={<ProposalActions
        proposal={proposal}
        title={proposal.remark}
        decodedCallData={decodedCallData}
      />}
    >
      <ProposalLayoutContainer>
        <ProposalDetails
          proposal={proposal}
          externalAbi={externalAbi}
          decodedCallData={decodedCallData}
          isExternalProposalSituation={isExternalProposalSituation}
        />

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
