import { Classification, ParameterType } from '@q-dev/q-js-sdk';

interface FormParameter {
  type: ParameterType;
  key: string;
  value: string;
  isNew?: boolean;
}

interface FormDelegation {
  address: string;
  amount: string;
}

type ExpertType = 'fees-incentives' | 'defi' | 'root-node';

type GeneralSituationType = 'raise-topic' | 'create-voting' | 'remove-voting';
type MembershipSituationType = 'add-member' | 'remove-member';

interface QProposalForm {
  type: string;
  generalSituationType: GeneralSituationType;
  membershipSituationType: MembershipSituationType;
  candidateAddress: string;
  hash: string;
  classification: Classification;
  externalLink: string;
  isParamsChanged: boolean;
  params: FormParameter[];
}

interface ExpertProposalForm {
  type: 'add-expert' | 'remove-expert' | 'parameter-vote';
  panelType: ExpertType;
  address: string;
  externalLink: string;
  params: FormParameter[];
}

type CreateProposalForm = QProposalForm | ExpertProposalForm;
