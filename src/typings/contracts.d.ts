import { ContractRegistryInstance, SystemContractWithQBalance } from '@q-dev/q-js-sdk';
import { BaseContractInstance } from '@q-dev/q-js-sdk/lib/contracts/BaseContractInstance';
import { LiquidationAuctionInstance } from '@q-dev/q-js-sdk/lib/contracts/defi/LiquidationAuctionInstance';
import { SystemDebtAuctionInstance } from '@q-dev/q-js-sdk/lib/contracts/defi/SystemDebtAuctionInstance';
import { SystemSurplusAuctionInstance } from '@q-dev/q-js-sdk/lib/contracts/defi/SystemSurplusAuctionInstance';
import { ConstitutionInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/constitution/ConstitutionInstance';
import { ConstitutionVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/constitution/ConstitutionVotingInstance';
import { EmergencyUpdateVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/EmergencyUpdateVotingInstance';
import { EPDRMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPDRMembershipVotingInstance';
import { EPDRParametersInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPDRParametersInstance';
import { EPDRParametersVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPDRParametersVotingInstance';
import { EPQFIMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPQFIMembershipVotingInstance';
import { EPQFIParametersInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPQFIParametersInstance';
import { EPQFIParametersVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPQFIParametersVotingInstance';
import { EPRSMembershipVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPRSMembershipVotingInstance';
import { EPRSParametersInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPRSParametersInstance';
import { EPRSParametersVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/experts/EPRSParametersVotingInstance';
import { GeneralUpdateVotingInstance } from '@q-dev/q-js-sdk/lib/contracts/governance/GeneralUpdateVotingInstance';

export type ProposalsContract =
  | ConstitutionVotingInstance
  | EmergencyUpdateVotingInstance
  | GeneralUpdateVotingInstance
  | EPQFIMembershipVotingInstance
  | EPDRMembershipVotingInstance
  | EPQFIParametersVotingInstance
  | EPDRParametersVotingInstance
  | EPRSParametersVotingInstance
  | EPRSMembershipVotingInstance;

export type AuctionInstance = LiquidationAuctionInstance | SystemDebtAuctionInstance | SystemSurplusAuctionInstance;

type KeyOfType<T, U> = {
  [P in keyof T]: T[P] extends U ? P: never
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractPromise = Promise<BaseContractInstance<any> | SystemContractWithQBalance[]>;
export type ContractType = KeyOfType<ContractRegistryInstance, (val: string) => ContractPromise>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContractValue<T extends ContractType = any> = ReturnType<ContractRegistryInstance[T]>;

export type ProposalContractType =
  | 'constitutionVoting'
  | 'emergencyUpdateVoting'
  | 'generalUpdateVoting'
  | 'epqfiMembershipVoting'
  | 'epdrMembershipVoting'
  | 'epqfiParametersVoting'
  | 'epdrParametersVoting'
  | 'eprsMembershipVoting'
  | 'eprsParametersVoting';

export interface ProposalEvent {
  blockNumber: number;
  id: string;
  contract: ProposalContractType;
  status?: string;
}

export type ParametersInstance =
 | ConstitutionInstance
 | EPQFIParametersInstance
 | EPRSParametersInstance
 | EPDRParametersInstance;
