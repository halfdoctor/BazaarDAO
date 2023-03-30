// Delete
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { ProposalStatus, SubmitTransactionResponse } from '@q-dev/q-js-sdk';
import axios from 'axios';
import { ContractType, ProposalEvent } from 'typings/contracts';
import { CreateProposalForm } from 'typings/forms';
import { Proposal, ProposalType, VotingType } from 'typings/proposals';

import useNetworkConfig from 'hooks/useNetworkConfig';

import { setBaseVotingWeightInfo, setConstitutionHash, setConstitutionUpdateDate, setMinimalActiveBlock, setProposals } from './reducer';

import { getUserAddress, useAppSelector } from 'store';
import { useDaoVault } from 'store/dao-vault/hooks';

import { getConstitutionVotingInstance, getInstance, getVotingWeightProxyInstance } from 'contracts/contract-instance';
import { getMinimalActiveBlockHeight } from 'contracts/helpers/block-number';
import { createProposal, getProposalEvents } from 'contracts/helpers/voting';

import { dateToUnix } from 'utils/date';
import { captureError } from 'utils/errors';

function isProposalActive (item: ProposalEvent, minBlock: number) {
  return item.status === 'active' && item.blockNumber >= minBlock;
}

export function useBaseVotingWeightInfo () {
  const { constitutionUrl } = useNetworkConfig();
  const dispatch = useDispatch();

  const newParameter = useAppSelector(({ proposals }) => proposals.newParameter);
  const constitutionHash = useAppSelector(({ proposals }) => proposals.constitutionHash);
  const constitutionUpdateDate = useAppSelector(({ proposals }) => proposals.constitutionUpdateDate);
  const baseVotingWeightInfo = useAppSelector(({ proposals }) => proposals.baseVotingWeightInfo);

  async function getConstitutionHash () {
    try {
      const contract = await getConstitutionVotingInstance();
      const hash = await contract.constitutionHash();
      dispatch(setConstitutionHash(hash));
    } catch (error) {
      captureError(error);
    }
  }

  async function getConstitutionUpdateDate () {
    try {
      const contract = await getConstitutionVotingInstance();
      const constitutionCaller = axios.create({ baseURL: constitutionUrl });
      const [constitutionsHash, constitutionsRes] = await Promise.all([
        await contract.constitutionHash(),
        constitutionCaller.get('/constitution/list')
      ]);
      const constitution = constitutionsRes.data.find(({ hash }: { hash: string }) => constitutionsHash === `0x${hash}`);
      dispatch(setConstitutionUpdateDate(constitution.time * 1000));
    } catch (error) {
      captureError(error);
    }
  }

  async function getBaseVotingWeightInfo () {
    try {
      const contract = await getVotingWeightProxyInstance();
      const result = await contract.getBaseVotingWeightInfo(getUserAddress(), String(dateToUnix()));
      dispatch(setBaseVotingWeightInfo({ ...result }));
    } catch (error) {
      captureError(error);
    }
  }

  return {
    newParameter,
    constitutionHash,
    baseVotingWeightInfo,

    getConstitutionHash,
    getBaseVotingWeightInfo,
    getConstitutionUpdateDate,
    constitutionUpdateDate,
  };
}

export function useProposals () {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { loadDelegationInfo, loadLockInfo } = useDaoVault();
  const { getBaseVotingWeightInfo } = useBaseVotingWeightInfo();

  const minimalActiveBlock = useAppSelector(({ proposals }) => proposals.minimalActiveBlock);
  const proposalsMap = useAppSelector(({ proposals }) => proposals.proposalsMap);
  const proposalValues = useAppSelector(({ proposals }) => Object.values(proposals.proposalsMap));

  const getActiveProposalsByType = (type: ProposalType) => {
    return proposalsMap[type].proposals
      .filter(item => isProposalActive(item, minimalActiveBlock));
  };

  const getEndedProposalsByType = (type: ProposalType) => {
    return proposalsMap[type].proposals
      .filter(item => !isProposalActive(item, minimalActiveBlock));
  };

  const allProposals = proposalValues.reduce((acc, { proposals }) => {
    acc.push(...proposals);
    return acc;
  }, [] as ProposalEvent[]);

  const isProposalsLoading = proposalValues.some(({ isLoading }) => isLoading);
  const activeProposalsCount = allProposals.filter(item => isProposalActive(item, minimalActiveBlock)).length;
  const endedProposalsCount = allProposals.filter(item => !isProposalActive(item, minimalActiveBlock)).length;

  async function getProposals (type: ProposalType) {
    try {
      const { minimalActiveBlockHeight, lastBlockHeight } = await getMinimalActiveBlockHeight();
      const { proposals, lastBlock } = proposalsMap[type];
      const newProposals = await getProposalEvents(type, proposals, lastBlock);

      dispatch(setProposals({
        type,
        proposals: newProposals,
        lastBlock: Number(lastBlockHeight)
      }));
      dispatch(setMinimalActiveBlock(minimalActiveBlockHeight));
    } catch (error) {
      captureError(error);
    }
  }

  async function createNewProposal (form: CreateProposalForm) {
    const userAddress = getUserAddress();
    await createProposal(form, userAddress);
  }

  async function voteForProposal ({ proposal, type, isVotedFor }: {
    proposal: Proposal;
    type: VotingType;
    isVotedFor?: boolean;
  }) {
    const userAddress = getUserAddress();
    const contract = await getInstance(proposal.contract)();

    let receipt: SubmitTransactionResponse | undefined;
    let methodError: string | undefined;
    switch (type) {
      case 'constitution':
        if ('veto' in contract) {
          receipt = await contract.veto(proposal.id, { from: userAddress });
        } else {
          methodError = 'veto';
        }
        break;
      case 'basic':
        if ('voteFor' in contract && 'voteAgainst' in contract) {
          receipt = isVotedFor
            ? await contract.voteFor(proposal.id, { from: userAddress })
            : await contract.voteAgainst(proposal.id, { from: userAddress });
        } else {
          methodError = isVotedFor ? 'voteFor' : 'voteAgainst';
        }
        break;
    }

    if (methodError && !receipt) {
      throw new Error(t('ERROR_METHOD_MISSING_FROM_CONTRACT', { method: methodError }));
    }

    receipt?.promiEvent
      .once('receipt', () => {
        getBaseVotingWeightInfo();
        loadDelegationInfo(userAddress);
        loadLockInfo(userAddress);
      });

    return receipt as SubmitTransactionResponse;
  }

  async function executeProposal (proposal: Proposal) {
    const userAddress = getUserAddress();
    const contract = await getInstance(proposal.contract)();

    let receipt: SubmitTransactionResponse | undefined;
    const promiseStatus = await contract.getStatus(proposal.id);

    if (promiseStatus === ProposalStatus.PASSED) {
      if ('execute' in contract) {
        receipt = await contract.execute(proposal.id, { from: userAddress });

        receipt.promiEvent
          .once('receipt', () => {
            getProposalsByContract(proposal.contract);
            getBaseVotingWeightInfo();
            loadDelegationInfo(userAddress);
          });
      } else {
        throw new Error(t('ERROR_METHOD_MISSING_FROM_CONTRACT', { method: 'execute' }));
      }
    } else {
      getProposalsByContract(proposal.contract);
      getBaseVotingWeightInfo();
      loadDelegationInfo(userAddress);
    }

    return receipt;
  }

  function getProposalsByContract (type: ContractType) {
    switch (type) {
      case 'constitutionVoting':
      case 'emergencyUpdateVoting':
      case 'generalUpdateVoting':
        return getProposals('q');
      case 'epqfiMembershipVoting':
      case 'epdrMembershipVoting':
      case 'epqfiParametersVoting':
      case 'epdrParametersVoting':
      case 'eprsMembershipVoting':
      case 'eprsParametersVoting':
        return getProposals('expert');
    }
  }

  async function getAllProposals () {
    getProposals('q');
    // Delay for localstorage sync with lastblock
    setTimeout(() => getProposals('expert'), 200);

    setTimeout(() => getAllProposals(), 240_000);
  }

  return {
    proposalsMap,
    isProposalsLoading,
    activeProposalsCount,
    endedProposalsCount,

    getActiveProposalsByType,
    getEndedProposalsByType,

    getAllProposals: useCallback(getAllProposals, []),
    getProposals: useCallback(getProposals, []),
    getProposalEvents: useCallback(getProposalEvents, []),
    createNewProposal: useCallback(createNewProposal, []),
    voteForProposal: useCallback(voteForProposal, []),
    executeProposal: useCallback(executeProposal, []),
  };
}
