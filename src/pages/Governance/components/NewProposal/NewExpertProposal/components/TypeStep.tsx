import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';
import { ExpertProposalForm } from 'typings/forms';

import { FormStep } from 'components/MultiStepForm';

import { useNewExpertProposal } from '../NewExpertProposal';

import { required } from 'utils/validators';

function TypeStep () {
  const { t } = useTranslation();
  const { goNext, onChange } = useNewExpertProposal();

  const form = useForm({
    initialValues: { type: 'add-expert' as ExpertProposalForm['type'] },
    validators: { type: [required] },
    onChange,
    onSubmit: goNext,
  });

  const typeOptions: RadioOptions<ExpertProposalForm['type']> = [
    {
      value: 'add-expert',
      label: t('ADD_A_NEW_EXPERT'),
      tip: t('ADD_EXPERT_TIP'),
    },
    {
      value: 'remove-expert',
      label: t('REMOVE_A_CURRENT_EXPERT'),
      tip: t('REMOVE_CURRENT_EXPERT_TIP')
    },
    {
      value: 'parameter-vote',
      label: t('PARAMETER_VOTE'),
      tip: t('PARAMETER_VOTE_TIP')
    },
  ];

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
    >
      <RadioGroup
        {...form.fields.type}
        extended
        name="expert-type"
        options={typeOptions}
      />
    </FormStep>
  );
}

export default TypeStep;
