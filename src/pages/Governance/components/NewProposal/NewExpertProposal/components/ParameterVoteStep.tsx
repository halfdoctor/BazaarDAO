import { useTranslation } from 'react-i18next';

import { useForm, useFormArray } from '@q-dev/form-hooks';
import { FieldOptions, Icon, RadioGroup } from '@q-dev/q-ui-kit';
import { ExpertProposalForm, ExpertType, FormParameter } from 'typings/forms';

import Button from 'components/Button';
import FormBlock from 'components/FormBlock';
import Input from 'components/Input';
import { FormStep } from 'components/MultiStepForm';
import ParameterForm from 'components/ParameterForm';

import { useNewExpertProposal } from '../NewExpertProposal';

import { CONTRACT_TYPES } from 'constants/contracts';
import { required, url } from 'utils/validators';

function ParameterVoteStep () {
  const { t } = useTranslation();
  const { goNext, goBack, onChange } = useNewExpertProposal();

  const form = useForm({
    initialValues: {
      panelType: 'fees-incentives' as ExpertType,
      externalLink: ''
    },
    validators: {
      panelType: [required],
      externalLink: [required, url],
    },
    onSubmit: (form) => {
      goNext(form as ExpertProposalForm);
    },
  });

  const formArray = useFormArray<FormParameter>({
    minCount: 1,
    maxCount: 30,
    onSubmit: (forms) => {
      onChange({ params: forms });
      form.submit();
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

  const handleSubmit = () => {
    if (!formArray.validate()) return;

    formArray.submit();
    form.submit();
  };

  const panelToContractType: Record<ExpertType, string> = {
    defi: CONTRACT_TYPES.qDefi,
    'fees-incentives': CONTRACT_TYPES.qFee,
    'root-node': CONTRACT_TYPES.qEprs,
  };

  return (
    <FormStep
      disabled={!form.isValid || !formArray.isValid}
      onNext={handleSubmit}
      onBack={goBack}
    >
      <RadioGroup
        {...form.fields.panelType}
        label={t('PANEL_WHICH_GOVERNS_THE_PARAMETER')}
        name="param-panel-type"
        options={panelTypeOptions}
      />

      <Input
        {...form.fields.externalLink}
        label={t('REFERENCE_LINK_TO_EXTERNAL_SOURCE')}
        placeholder={t('LINK')}
      />

      {formArray.forms.map((formItem, i) => (
        <FormBlock
          key={formItem.id}
          title={t('PARAMETER_INDEX', { index: i + 1 })}
          icon={formArray.forms.length > 1 ? 'delete' : undefined}
          onAction={() => formArray.removeForm(formItem.id)}
        >
          <ParameterForm
            key={formItem.id}
            contract={panelToContractType[form.values.panelType as ExpertType]}
            onChange={formItem.onChange}
          />
        </FormBlock>
      ))}

      <Button
        look="ghost"
        onClick={formArray.appendForm}
      >
        <Icon name="add" />
        <span>{t('ADD_PARAMETER')}</span>
      </Button>
    </FormStep>
  );
}

export default ParameterVoteStep;
