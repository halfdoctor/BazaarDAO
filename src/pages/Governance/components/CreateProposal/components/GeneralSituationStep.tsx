import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';
import { CreateProposalForm, GeneralSituationType } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useCreateProposalForm } from '../CreateProposal';

import { required, url } from 'utils/validators';

function GeneralSituationStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useCreateProposalForm();

  const form = useForm({
    initialValues: {
      generalSituationType: 'raise-topic' as GeneralSituationType,
      externalLink: '',
    },
    validators: {
      generalSituationType: [required],
      externalLink: [required, url],
    },
    onSubmit: (form) => {
      goNext(form as CreateProposalForm);
    },
  });

  const panelTypeOptions: RadioOptions<GeneralSituationType> = [
    {
      value: 'raise-topic',
      label: t('RAISE_SOME_TOPIC')
    },
    {
      value: 'create-voting',
      label: t('CREATE_VOTING_SITUATION'),
      disabled: true,
    },
    {
      value: 'remove-voting',
      label: t('REMOVE_VOTING_SITUATION'),
      disabled: true,
    },
  ];

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
      onBack={goBack}
    >
      <RadioGroup
        {...form.fields.generalSituationType}
        name="param-panel-type"
        options={panelTypeOptions}
      />
      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />
    </FormStep>
  );
}

export default GeneralSituationStep;
