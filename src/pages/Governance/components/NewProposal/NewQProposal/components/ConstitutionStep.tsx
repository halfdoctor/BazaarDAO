import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { Classification } from '@q-dev/q-js-sdk';
import { RadioGroup, RadioOptions } from '@q-dev/q-ui-kit';
import { QProposalForm } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useNewQProposalForm } from '../NewQProposal';

import { hash, required, url } from 'utils/validators';

function ConstitutionStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewQProposalForm();

  const form = useForm({
    initialValues: {
      classification: Classification.FUNDAMENTAL,
      hash: '',
      externalLink: ''
    },
    validators: {
      classification: [required],
      hash: [required, hash],
      externalLink: [required, url],
    },
    onSubmit: (form) => {
      goNext(form as QProposalForm);
    },
  });

  const partOptions: RadioOptions<Classification> = [
    {
      value: Classification.FUNDAMENTAL,
      label: t('FUNDAMENTAL_PART'),
      tip: t('PREAMBLE')
    },
    {
      value: Classification.BASIC,
      label: t('BASIC_PART'),
      tip: t('MAIN_BODY_AND_DEFINITIONS')
    },
    {
      value: Classification.DETAILED,
      label: t('DETAILED_PART'),
      tip: t('SELECTED_APPENDICES')
    },
  ];

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
      onBack={goBack}
    >
      <RadioGroup
        {...form.fields.classification}
        label={t('CONSTITUTION_PART_AFFECTED')}
        name="constition-part"
        options={partOptions}
      />

      <Input
        {...form.fields.hash}
        label={t('NEW_CONSTITUTION_HASH')}
        placeholder={t('HASH')}
      />

      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />
    </FormStep>
  );
}

export default ConstitutionStep;
