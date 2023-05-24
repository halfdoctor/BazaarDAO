import { ParameterType } from '@q-dev/gdk-sdk';

interface FormParameter {
  type: ParameterType;
  key: string;
  value: string;
  isNew?: boolean;
}

interface ParameterKey {
  name: string;
  solidityType: string;
  value: string;
}

type GeneralSituationType = 'raise-topic' | 'create-voting' | 'remove-voting';
type MembershipSituationType = 'add-member' | 'remove-member';
type ParameterSituationType = 'configuration' | 'regular' | 'aggregate';

interface NewProposalForm {
  type: string;
  panel: string;
  generalSituationType: GeneralSituationType;
  membershipSituationType: MembershipSituationType;
  candidateAddress: string;
  hash: string;
  externalLink: string;
  isParamsChanged: boolean;
  params: FormParameter[];
}
