import { BaseVotingWeightInfo } from '@q-dev/q-js-sdk';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import orderBy from 'lodash/orderBy';
import { ProposalEvent } from 'typings/contracts';
import { ProposalType } from 'typings/proposals';

interface ProposalItem {
  proposals: ProposalEvent[];
  isLoading: boolean;
  lastBlock: number;
}

interface ProposalsState {
  baseVotingWeightInfo: BaseVotingWeightInfo;
  proposalsMap: Record<ProposalType, ProposalItem>;
  minimalActiveBlock: number;
  constitutionHash: string;
  constitutionUpdateDate: number;
  newParameter: boolean;
}

function getDefaultProposalItem (): ProposalItem {
  return { proposals: [], isLoading: true, lastBlock: 0 };
}

const initialState: ProposalsState = {
  constitutionHash: '',
  constitutionUpdateDate: 0,
  newParameter: false,
  minimalActiveBlock: 0,
  baseVotingWeightInfo: {
    delegationStatus: '',
    lockedUntil: '',
    ownWeight: '0',
    votingAgent: ''
  },
  proposalsMap: {
    q: getDefaultProposalItem(),
    expert: getDefaultProposalItem(),
  }
};

const proposalsSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    setProposals: (state, { payload }: PayloadAction<{
      type: ProposalType;
      proposals: ProposalEvent[];
      lastBlock: number;
    }>) => {
      state.proposalsMap[payload.type] = {
        proposals: orderBy(payload.proposals, 'blockNumber', 'desc'),
        isLoading: false,
        lastBlock: payload.lastBlock
      };
    },

    setMinimalActiveBlock: (state, { payload }: PayloadAction<number>) => {
      state.minimalActiveBlock = payload;
    },

    setConstitutionHash: (state, { payload }: PayloadAction<string>) => {
      state.constitutionHash = payload;
    },

    setConstitutionUpdateDate: (state, { payload }: PayloadAction<number>) => {
      state.constitutionUpdateDate = payload;
    },

    setNewParameter: (state, { payload }: PayloadAction<boolean>) => {
      state.newParameter = payload;
    },

    setBaseVotingWeightInfo: (state, { payload }: PayloadAction<BaseVotingWeightInfo>) => {
      state.baseVotingWeightInfo = payload;
    }
  }
});

export const {
  setProposals,
  setMinimalActiveBlock,
  setConstitutionHash,
  setNewParameter,
  setBaseVotingWeightInfo,
  setConstitutionUpdateDate,
} = proposalsSlice.actions;
export default proposalsSlice.reducer;
