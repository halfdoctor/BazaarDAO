import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioGroup, RadioOptions, Tip } from '@q-dev/q-ui-kit';

import { FormStep } from 'components/MultiStepForm';

import useProposalActionsInfo from 'hooks/useProposalActionsInfo';
import useProposalSteps from 'hooks/useProposalSteps';

import { useNewProposalForm } from '../NewProposalForm';

import { useProviderStore } from 'store/provider/hooks';

import { required } from 'utils/validators';

function TypeStep ({ situations, panelName }: { situations: string[]; panelName: string }) {
  const { t } = useTranslation();
  const { currentProvider } = useProviderStore();
  const { goNext, onChange } = useNewProposalForm();
  const { proposalSteps } = useProposalSteps();
  const { checkIsUserCanCreateProposal } = useProposalActionsInfo();
  const [isUserHasVotingPower, setIsUserHasVotingPower] = useState(true);
  const [isUserMember, setIsUserMember] = useState(true);

  const form = useForm({
    initialValues: {
      type: DefaultVotingSituations.GeneralSituation as string,
      panel: panelName
    },
    validators: {
      type: [required],
      panel: [required]
    },
    onChange,
    onSubmit: goNext,
  });

  const typeOptions: RadioOptions<string> = useMemo(() => {
    return situations.map(item => {
      return proposalSteps.find(el => el.value === item) || {
        value: item,
        label: item,
        tip: t('COMING_SOON'),
        disabled: true
      };
    });
  }, [situations]);

  const loadPermissions = async () => {
    const userPermission = await checkIsUserCanCreateProposal(panelName, form.values.type);
    setIsUserHasVotingPower(userPermission.isUserHasVotingPower);
    setIsUserMember(userPermission.isUserMember);
  };

  useEffect(() => {
    loadPermissions();
  }, [form.values.type, panelName]);

  return (
    <FormStep
      disabled={!form.isValid || !isUserMember || !isUserHasVotingPower}
      onNext={form.submit}
    >
      {(!isUserHasVotingPower || !isUserMember) && currentProvider?.selectedAddress &&
        <Tip type="warning">
          {isUserHasVotingPower ? t('NEED_MEMBER_STATUS') : t('NEED_VOTING_POWER')}
        </Tip>}
      <RadioGroup
        {...form.fields.type}
        extended
        name="type"
        options={typeOptions}
      />
    </FormStep>
  );
}

export default TypeStep;
