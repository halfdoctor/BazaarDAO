import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';
import { QProposalForm } from 'typings/forms';

import { FormStep } from 'components/MultiStepForm';

import { useNewQProposalForm } from '../NewQProposal';

import { required } from 'utils/validators';

function TypeStep () {
  const { t } = useTranslation();
  const { goNext, onChange } = useNewQProposalForm();

  const form = useForm({
    initialValues: { type: 'constitution' as QProposalForm['type'] },
    validators: { type: [required] },
    onChange,
    onSubmit: goNext,
  });

  const typeOptions: RadioOptions<QProposalForm['type']> = [
    {
      value: 'constitution',
      label: t('CONSTITUTION_UPDATE'),
      tip: t('CONSTITUTION_UPDATE_TIP')
    },
    {
      value: 'general',
      label: t('GENERAL_Q_UPDATE'),
      tip: t('GENERAL_Q_UPDATE_TIP')
    },
    {
      value: 'emergency',
      label: t('EMERGENCY_UPDATE'),
      tip: t('EMERGENCY_UPDATE_TIP')
    }
  ];

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
    >
      <RadioGroup
        {...form.fields.type}
        extended
        name="q-type"
        options={typeOptions}
      />
    </FormStep>
  );
}

export default TypeStep;
