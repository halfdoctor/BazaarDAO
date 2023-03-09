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

interface QProposalForm {
  type: 'constitution' | 'emergency' | 'general';
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
