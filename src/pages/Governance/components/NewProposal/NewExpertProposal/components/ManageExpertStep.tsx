import { useTranslation } from 'react-i18next';

import { useForm } from '@q-dev/form-hooks';
import { FieldOptions, RadioGroup } from '@q-dev/q-ui-kit';
import { ExpertProposalForm, ExpertType } from 'typings/forms';

import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';

import { useNewExpertProposal } from '../NewExpertProposal';

import { address, required, url } from 'utils/validators';

function ManageExpertStep () {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewExpertProposal();

  const form = useForm({
    initialValues: {
      panelType: 'fees-incentives',
      address: '',
      externalLink: ''
    },
    validators: {
      panelType: [required],
      address: [required, address],
      externalLink: [required, url],
    },
    onSubmit: (form) => {
      goNext(form as ExpertProposalForm);
    },
  });

  const panelTypeOptions: FieldOptions<ExpertType> = [
    {
      value: 'fees-incentives',
      label: t('Q_FEES_INCENTIVES_MEMBERSHIP_PANEL')
    },
    {
      value: 'defi',
      label: t('Q_DEFI_MEMBERSHIP_PANEL')
    },
    {
      value: 'root-node',
      label: t('Q_ROOT_NODE_SELECTION_EXPERT_PANEL')
    },
  ];

  return (
    <FormStep
      disabled={!form.isValid}
      onNext={form.submit}
      onBack={goBack}
    >
      <RadioGroup
        {...form.fields.panelType}
        label={t('EXPERT_PANEL_TYPE')}
        name="expert-panel-type"
        options={panelTypeOptions}
      />

      <Input
        {...form.fields.address}
        label={t('CANDIDATE_Q_ADDRESS')}
        placeholder={t('ADDRESS_PLACEHOLDER')}
      />

      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />
    </FormStep>
  );
}

export default ManageExpertStep;
