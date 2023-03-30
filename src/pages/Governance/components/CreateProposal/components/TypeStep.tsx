import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';

import { FormStep } from 'components/MultiStepForm';

import { useCreateProposalForm } from '../CreateProposal';

import { required } from 'utils/validators';

function TypeStep ({ situations }: { situations: string[] }) {
  const { t } = useTranslation();
  const { goNext, onChange } = useCreateProposalForm();

  const form = useForm({
    initialValues: { type: DefaultVotingSituations.GeneralSituation as string },
    validators: { type: [required] },
    onChange,
    onSubmit: goNext,
  });

  const DEFAULT_PROPOSALS: RadioOptions<string> = [
    {
      value: DefaultVotingSituations.ConstitutionSituation,
      label: t('CONSTITUTION_UPDATE'),
      tip: t('CONSTITUTION_UPDATE_TIP')
    },
    {
      value: DefaultVotingSituations.GeneralSituation,
      label: t('GENERAL_Q_UPDATE'),
      tip: t('GENERAL_Q_UPDATE_TIP')
    },
    {
      value: DefaultVotingSituations.ParameterSituation,
      label: t('PARAMETER_VOTE'),
      tip: t('PARAMETER_VOTE')
    },
    {
      value: DefaultVotingSituations.MembershipSituation,
      label: t('MEMBERSHIP_VOTE'),
      tip: t('MEMBERSHIP_VOTE')
    },
  ];

  const typeOptions: RadioOptions<string> = useMemo(() => {
    return situations.map(item => {
      return DEFAULT_PROPOSALS.find(el => el.value === item) || {
        value: item,
        label: item,
        tip: t('COMING_SOON'),
        disabled: true
      };
    });
  }, [situations]);

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
    >
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
