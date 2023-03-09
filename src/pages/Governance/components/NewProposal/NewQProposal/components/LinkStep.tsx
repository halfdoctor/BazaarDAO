import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useNewQProposalForm } from '../NewQProposal';

import { required, url } from 'utils/validators';

function LinkStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewQProposalForm();

  const form = useForm({
    initialValues: { externalLink: '' },
    validators: { externalLink: [required, url] },
    onSubmit: goNext,
  });

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
      onBack={goBack}
    >
      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />
    </FormStep>
  );
}

export default LinkStep;
