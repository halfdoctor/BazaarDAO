import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Classification, ProposalStatus } from '@q-dev/q-js-sdk';
import { TagState } from '@q-dev/q-ui-kit/dist/components/Tag';
import { Proposal } from 'typings/proposals';

function useProposalDetails (proposal: Proposal | null) {
  const { t, i18n } = useTranslation();

  const statusMap: Record<ProposalStatus, string> = {
    [ProposalStatus.ACCEPTED]: t('STATUS_ACCEPTED'),
    [ProposalStatus.EXECUTED]: t('STATUS_EXECUTED'),
    [ProposalStatus.EXPIRED]: t('STATUS_EXPIRED'),
    [ProposalStatus.NONE]: t('STATUS_NONE'),
    [ProposalStatus.PASSED]: t('STATUS_PASSED'),
    [ProposalStatus.PENDING]: t('STATUS_PENDING'),
    [ProposalStatus.REJECTED]: t('STATUS_REJECTED'),
    [ProposalStatus.OBSOLETE]: t('STATUS_OBSOLETE'),
  };

  const getStatusState = (): TagState => {
    switch (proposal?.status) {
      case ProposalStatus.PENDING:
        return 'pending';
      case ProposalStatus.REJECTED:
      case ProposalStatus.EXPIRED:
        return 'rejected';
      default:
        return 'approved';
    }
  };

  const getTitle = () => {
    const classificationMap: Record<Classification, string> = {
      [Classification.BASIC]: t('CLASSIFICATION_BASIC'),
      [Classification.DETAILED]: t('CLASSIFICATION_DETAILED'),
      [Classification.FUNDAMENTAL]: t('CLASSIFICATION_FUNDAMENTAL'),
    };

    switch (proposal?.contract) {
      case 'constitutionVoting':
        return t('CONSTITUTION_PROPOSAL', {
          classification: classificationMap[proposal.classification || Classification.BASIC]
        });
      case 'generalUpdateVoting':
        return t('GENERAL_UPDATE_PROPOSAL');
      case 'emergencyUpdateVoting':
        return t('EMERGENCY_UPDATE_PROPOSAL');
      case 'eprsMembershipVoting':
        return t('Q_ROOT_NODE_SELECTION_EXPERT_MEMBERSHIP_PROPOSAL');
      case 'epdrMembershipVoting':
        return t('DEFI_RISK_EXPERT_MEMBERSHIP_PROPOSAL');
      case 'epqfiMembershipVoting':
        return t('FEES_INCENTIVES_EXPERTS_MEMBERSHIP_PROPOSAL');
      case 'eprsParametersVoting':
        return t('Q_ROOT_NODE_SELECTION_PARAMETERS_PROPOSAL');
      case 'epdrParametersVoting':
        return t('DEFI_RISK_PARAMETERS_PROPOSAL');
      case 'epqfiParametersVoting':
        return t('FEES_INCENTIVES_PARAMETERS_PROPOSAL');
      default:
        return t('UNKNOWN_PROPOSAL');
    }
  };

  return {
    title: useMemo(getTitle, [proposal, i18n.language]),
    status: statusMap[proposal?.status || ProposalStatus.NONE],
    state: useMemo(getStatusState, [proposal, i18n.language]),
  };
}

export default useProposalDetails;
