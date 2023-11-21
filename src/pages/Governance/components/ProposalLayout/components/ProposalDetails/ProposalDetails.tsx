import { useTranslation } from 'react-i18next';

import { DAO_RESERVED_NAME, DecodedData, DefaultVotingSituations } from '@q-dev/gdk-sdk';
import styled from 'styled-components';
import { ProposalBaseInfo } from 'typings/proposals';

import BaseDetails from './components/BaseDetails';
import ExternalCallDataDetails from './components/ExternalCallDataDetails';
import GeneralSituationDetails from './components/GeneralSituationDetails';
import MembershipSituationsProposalDetails from './components/MembershipSituationsProposalDetails';
import MultiCallList from './components/MultiCallList';
import ParamsList from './components/ParamsList';

export const ProposalDetailsContainer = styled.div`
  display: grid;
  grid-gap: 24px;
`;

interface Props {
  proposal: ProposalBaseInfo;
  decodedCallData: DecodedData | null;
  externalAbi?: string[];
  isExternalProposalSituation: boolean;
}

function ProposalDetails ({ proposal, decodedCallData, externalAbi, isExternalProposalSituation }: Props) {
  const { t } = useTranslation();

  const hasParamsList = decodedCallData !== null && (
    proposal.relatedVotingSituation === DefaultVotingSituations.RegularParameter ||
    proposal.relatedVotingSituation === DefaultVotingSituations.ConfigurationParameter ||
    proposal.relatedVotingSituation === DefaultVotingSituations.Constitution
  );

  const hasMultiCallList = decodedCallData !== null &&
    proposal.relatedExpertPanel === DAO_RESERVED_NAME && (
    proposal.relatedVotingSituation === DefaultVotingSituations.DAORegistry ||
    proposal.relatedVotingSituation === DefaultVotingSituations.PermissionManager
  );

  const hasMembershipDetails = decodedCallData !== null &&
      proposal.relatedVotingSituation === DefaultVotingSituations.Membership;

  const isGeneralProposal = decodedCallData !== null &&
    proposal.relatedVotingSituation === DefaultVotingSituations.General;

  return (
    <ProposalDetailsContainer className="block">
      <div>
        <h2 className="text-h2">{t('DETAILS')}</h2>

        <div className="block__content">
          <div className="details-list single-column">
            {hasMembershipDetails && (
              <MembershipSituationsProposalDetails
                decodedCallData={decodedCallData}
              />
            )}
            <BaseDetails proposal={proposal} />

          </div>
        </div>
      </div>

      {isGeneralProposal && (
        <GeneralSituationDetails decodedCallData={decodedCallData} />
      )}

      {hasParamsList && (
        <ParamsList decodedCallData={decodedCallData} />
      )}

      {hasMultiCallList && (
        <MultiCallList
          decodedCallData={decodedCallData}
          votingSituation={proposal.relatedVotingSituation}
        />
      )}

      {isExternalProposalSituation && (
        <ExternalCallDataDetails
          callData={proposal.callData}
          externalAbi={externalAbi}
          votingSituation={proposal.relatedVotingSituation}
        />
      )}
    </ProposalDetailsContainer>
  );
}

export default ProposalDetails;
