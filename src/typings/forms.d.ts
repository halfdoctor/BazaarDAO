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

interface VotingSituationForm {
  situationName: string;
  vetoPeriod: string;
  proposalExecutionPeriod: string;
  requiredQuorum: string;
  requiredMajority: string;
  requiredVetoQuorum: string;
  votingType: string;
  votingTarget: string;
  votingMinAmount: string;
  externalLink: string;
  votingPeriod: string;
}

interface DeleteVotingSituationForm {
  situationNameForRemoval: string;
}

interface NewProposalForm {
  type: string;
  panel: string;
  generalSituationType: GeneralSituationType;
  membershipSituationType: MembershipSituationType;
  candidateAddress: string;
  hash: string;
  remark: string;
  isParamsChanged: boolean;
  params: FormParameter[];
  newVotingSituation: VotingSituationForm | null;
  situationNameForRemoval: string;
  callData: string[];
}

interface CallDataProposalForm {
  callData: string;
  abiFunction: string;
}

type FormValidatesMap = Record<string, () => boolean>;
