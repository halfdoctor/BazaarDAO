import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, useForm } from '@q-dev/form-hooks';
import { Icon, Select, Spinner } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';
import { checkSupportingExternalSituationContractAddress } from 'helpers';
import i18n from 'i18next';
import styled from 'styled-components';
import { VotingSituationForm } from 'typings/forms';
import { VotingSituation } from 'typings/proposals';

import Input from 'components/Input';

import { useDaoStore } from 'store/dao/hooks';
import { useDaoTokenStore } from 'store/dao-token/hooks';

import { VOTING_TYPE_TRANSLATION_KEY_MAP } from 'constants/proposal';
import type { Validator } from 'utils/validators';
import { address, httpUrl, integer, min, name, percent, required } from 'utils/validators';

interface Props {
  panelSituations: VotingSituation[];
  onChange: (form: Form<VotingSituationForm>) => void;
  isValidContract: boolean;
  isValidateContractLoading: boolean;
  setIsValidContract: (val: boolean) => void;
  setIsValidateContractLoading: (val: boolean) => void;
}

const CheckIcon = styled(Icon)<{$isValid: boolean}>`
  &.q-ui-icon {
    color: ${({ theme, $isValid }) => $isValid ? theme.colors.successMain : theme.colors.errorMain}
  }
`;

function validateExistName (situations: VotingSituation[]): Validator<string> {
  return (val) => {
    return {
      isValid: !situations.some(({ name }) => name === val),
      message: i18n.t('VALIDATION_EXIST_NAME')
    };
  };
};

function CreateVotingSituationForm ({
  onChange,
  panelSituations,
  isValidContract,
  isValidateContractLoading,
  setIsValidContract,
  setIsValidateContractLoading,
}: Props) {
  const { t } = useTranslation();
  const { tokenInfo } = useDaoTokenStore();
  const { canDAOSupportSituationExternalLinks } = useDaoStore();
  const { address: accountAddress, currentProvider } = useWeb3Context();

  const form = useForm({
    initialValues: {
      situationName: '',
      votingPeriod: '',
      vetoPeriod: '',
      proposalExecutionPeriod: '',
      requiredQuorum: '',
      requiredMajority: '',
      requiredVetoQuorum: '',
      votingType: '',
      votingTarget: '',
      votingMinAmount: '',
      externalLink: '',
    },
    validators: {
      situationName: [required, name, validateExistName(panelSituations)],
      votingPeriod: [required, integer],
      vetoPeriod: [required, integer],
      proposalExecutionPeriod: [required, integer],
      requiredQuorum: [required, percent],
      requiredMajority: [required, percent],
      requiredVetoQuorum: [required, percent],
      votingType: [required],
      votingTarget: [required, address],
      votingMinAmount: tokenInfo?.type === 'native' || tokenInfo?.type === 'erc20'
        ? [required, min(0)]
        : [],
      externalLink: canDAOSupportSituationExternalLinks
        ? [required, httpUrl]
        : []
    },
  });

  const votingTypeOptions = Object.entries(VOTING_TYPE_TRANSLATION_KEY_MAP)
    .map(([key, val]) => ({
      value: key,
      label: t(val)
    }));

  async function checkContractInterface () {
    if (currentProvider && form.validateByKey('votingTarget', true)) {
      setIsValidateContractLoading(true);

      const isSupported = await checkSupportingExternalSituationContractAddress(
        form.values.votingTarget,
        currentProvider,
        accountAddress
      );

      if (!isSupported) form.setError('votingTarget', t('CONTRACT_INTERFACE_NOT_SUPPORTED'));

      setIsValidContract(isSupported);
      setIsValidateContractLoading(false);
    } else {
      setIsValidContract(false);
    }
  }

  useEffect(() => {
    checkContractInterface();
  }, [form.values.votingTarget, currentProvider, accountAddress]);

  useEffect(() => {
    onChange(form);
  }, [form.values, onChange]);

  return (
    <>
      <Input
        {...form.fields.situationName}
        label={t('VOTING_SITUATION_NAME')}
        placeholder={t('NAME')}
        maxLength={100}
      />
      <Input
        {...form.fields.votingPeriod}
        label={t('VOTING_PERIOD')}
        placeholder={t('SECONDS')}
        type="number"
      />

      <Input
        {...form.fields.vetoPeriod}
        label={t('VETO_PERIOD')}
        placeholder={t('SECONDS')}
        type="number"
      />
      <Input
        {...form.fields.proposalExecutionPeriod}
        label={t('PROPOSAL_EXECUTION_PERIOD')}
        placeholder={t('SECONDS')}
        type="number"
        decimals={2}
      />

      <Input
        {...form.fields.requiredQuorum}
        label={t('REQUIRED_QUORUM')}
        placeholder="0-100%"
        type="number"
        decimals={2}
      />

      <Input
        {...form.fields.requiredMajority}
        label={t('REQUIRED_MAJORITY')}
        placeholder="0-100%"
        type="number"
      />

      <Input
        {...form.fields.requiredVetoQuorum}
        label={t('REQUIRED_VETO_QUORUM')}
        placeholder="0-100%"
        type="number"
      />

      <Select
        {...form.fields.votingType}
        label={t('VOTING_TYPE')}
        placeholder={t('TYPE')}
        options={votingTypeOptions}
      />

      <Input
        {...form.fields.votingTarget}
        label={t('VOTING_TARGET')}
        placeholder={t('CONTRACT_ADDRESS')}
        prefix={Boolean(form.values.votingTarget) && (
          isValidateContractLoading
            ? <Spinner />
            : <CheckIcon
              $isValid={isValidContract}
              name={isValidContract ? 'double-check' : 'cross'}
            />
        )}
      />

      {(tokenInfo?.type === 'native' || tokenInfo?.type === 'erc20') && (
        <Input
          {...form.fields.votingMinAmount}
          label={t('VOTING_MIN_AMOUNT')}
          placeholder={t('AMOUNT_IN_TOKEN', { tokenSymbol: tokenInfo.symbol })}
          decimals={tokenInfo.decimals}
          type="number"
        />
      )}

      {canDAOSupportSituationExternalLinks && (
        <Input
          {...form.fields.externalLink}
          label={t('EXTERNAL_LINK')}
          placeholder={t('LINK')}
          maxLength={200}
        />
      )}
    </>
  );
}

export default CreateVotingSituationForm;
