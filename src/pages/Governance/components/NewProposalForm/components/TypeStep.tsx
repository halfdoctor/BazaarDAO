import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { useForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Icon, RadioGroup, Spinner, Tooltip } from '@q-dev/q-ui-kit';
import { useWeb3Context } from 'context/Web3ContextProvider';
import styled from 'styled-components';
import { VotingSituation } from 'typings/proposals';

import { FormStep } from 'components/MultiStepForm';

import useProposalActionsInfo from 'hooks/useProposalActionsInfo';
import useProposalSteps from 'hooks/useProposalSteps';

import { useNewProposalForm } from '../NewProposalForm';

import { useDaoStore } from 'store/dao/hooks';

import { AVAILABLE_VOTING_SITUATIONS } from 'constants/proposal';
import { RoutePaths } from 'constants/routes';
import { required } from 'utils/validators';

const DEFAULT_VOTING_SITUATIONS_LIST = Object.values(DefaultVotingSituations);

const HAS_COMING_SOON_SITUATION = new Set(
  [
    ...AVAILABLE_VOTING_SITUATIONS,
    ...DEFAULT_VOTING_SITUATIONS_LIST
  ]).size !== DEFAULT_VOTING_SITUATIONS_LIST.length;

const SpinnerWrap = styled.div`
  width: fit-content;
  margin: 60px auto;
`;

const RadioGroupLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
  width: 100%;

  .radio-group-label__tooltip {
    margin: 4px 0 auto;
  }
`;

const RadioGroupWrapper = styled.div`
  .q-ui-radio-group__option {
    grid-template-columns: 20px 1fr;
  }
`;

interface Props {
  situations: VotingSituation[];
  panelName: string;
}

interface ProposalPermissions {
  value: string;
  isComingSoon: boolean;
  isUserHasVotingPower: boolean;
  isUserMember: boolean;
  isExternal: boolean;
  description: string;
  isDisabled: boolean;
  hasExternalAbi: boolean;
}

function TypeStep ({ situations, panelName }: Props) {
  const { t } = useTranslation();
  const { composeDaoLink } = useDaoStore();
  const { address: accountAddress } = useWeb3Context();
  const { goNext, onChange } = useNewProposalForm();
  const { proposalOptionsMap } = useProposalSteps();
  const { checkIsUserCanCreateProposal } = useProposalActionsInfo();
  const [proposalPermissions, setProposalPermissions] = useState<ProposalPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm({
    initialValues: {
      type: '',
      panel: panelName
    },
    validators: {
      type: [required],
      panel: [required]
    },
    onChange,
    onSubmit: goNext,
  });

  const loadPermissions = async () => {
    setIsLoading(true);
    const allPermissions = await Promise.all(situations.map(async (item) => {
      let isComingSoon = false;
      if (HAS_COMING_SOON_SITUATION && !item.isExternal) {
        isComingSoon = !AVAILABLE_VOTING_SITUATIONS.find(el => el === item.name);
      }

      const { isUserHasVotingPower, isUserMember } = await checkIsUserCanCreateProposal(panelName, item.name);

      return {
        value: item.name,
        isExternal: item.isExternal,
        isUserMember,
        isUserHasVotingPower,
        isComingSoon,
        hasExternalAbi: Boolean(item.externalInfo?.abi),
        description: item.externalInfo?.description || '',
        isDisabled: (item.isExternal && !item.externalInfo?.abi) ||
          isComingSoon || !isUserHasVotingPower || !isUserMember
      };
    }));
    setProposalPermissions(allPermissions);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPermissions();
  }, [panelName, situations]);

  useEffect(() => {
    if (proposalPermissions.length && accountAddress) {
      const permission = proposalPermissions.find(i => !i.isDisabled);
      if (permission) {
        form.fields.type.onChange(permission.value);
      }
    }
  }, [proposalPermissions, panelName, accountAddress]);

  const options = proposalPermissions.map((item) => ({
    value: item.value,
    tip: item.isComingSoon
      ? t('COMING_SOON')
      : item.isExternal
        ? item.description
        : proposalOptionsMap[item.value]?.tip,
    disabled: item.isDisabled,
    label: item.isComingSoon
      ? item.value
      : !accountAddress || (item.isExternal
        ? item.hasExternalAbi && item.isUserHasVotingPower && item.isUserMember
        : item.isUserHasVotingPower && item.isUserMember
      )
        ? proposalOptionsMap[item.value]?.label || item.value
        : (
          <RadioGroupLabel key={item.value}>
            <span className="text-lg font-semibold" style={{ width: '100%', display: 'block' }}>
              {proposalOptionsMap[item.value]?.label || item.value}
            </span>
            <Tooltip
              className="radio-group-label__tooltip"
              trigger={<Icon name="info" className="text-lg color-primary" />}
            >
              {item.isExternal && !item.hasExternalAbi
                ? t('TOOLTIP_FAILED_LOAD_ABI')
                : item.isUserHasVotingPower
                  ? t('NEED_MEMBER_STATUS')
                  : <Trans
                    i18nKey="NEED_VOTING_POWER"
                    components={{
                      votingPowerLink: <NavLink
                        style={{ textDecoration: 'underline' }}
                        to={composeDaoLink(RoutePaths.votingPower)}
                      />
                    }}
                  />
              }
            </Tooltip>
          </RadioGroupLabel>
        )
  }));

  if (isLoading) {
    return (
      <SpinnerWrap>
        <Spinner size={60} />
      </SpinnerWrap>
    );
  }

  return (
    <FormStep
      disabled={!form.isValid || isLoading || !form.values.type}
      onNext={form.submit}
    >
      <RadioGroupWrapper>
        <RadioGroup
          {...form.fields.type}
          extended
          name="type"
          options={options}
        />
      </RadioGroupWrapper>
    </FormStep>
  );
}

export default TypeStep;
