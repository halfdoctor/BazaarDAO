import { useRef } from 'react';
import { useTranslation, } from 'react-i18next';

import { useFormArray } from '@q-dev/form-hooks';
import { DefaultVotingSituations } from '@q-dev/gdk-sdk';
import { Icon } from '@q-dev/q-ui-kit';
import { CallDataProposalForm, FormValidatesMap } from 'typings/forms';

import Button from 'components/Button';
import FormBlock from 'components/FormBlock';
import { FormStep } from 'components/MultiStepForm';

import { useNewProposalForm } from '../NewProposalForm';

import CallDataForm from './CallDataForm';

import { DAO_REGISTRY_AVAILABLE_FUNCTIONS, PERMISSION_MANAGER_AVAILABLE_FUNCTIONS } from 'constants/proposal';

const MAX_UPGRADES_COUNT = 10;

const AVAILABLE_SITUATIONS_INFO_MAP = {
  [DefaultVotingSituations.DAORegistry as string]: {
    titleKey: 'UPGRADE_INDEX',
    abiName: 'DAORegistry',
    functions: Object.values(DAO_REGISTRY_AVAILABLE_FUNCTIONS)
  },
  [DefaultVotingSituations.PermissionManager as string]: {
    titleKey: 'PERMISSION_INDEX',
    abiName: 'PermissionManager',
    functions: Object.values(PERMISSION_MANAGER_AVAILABLE_FUNCTIONS)
  },
};

function CallDataStep ({ situation }: { situation: string}) {
  const { t } = useTranslation();
  const { goNext, goBack } = useNewProposalForm();
  const formValidatesMap = useRef<FormValidatesMap>({});

  const formArray = useFormArray<CallDataProposalForm>({
    minCount: 1,
    maxCount: MAX_UPGRADES_COUNT,
    onSubmit: (forms) => {
      goNext({ callData: forms.map(i => i.callData) });
    },
  });

  const handleSubmit = () => {
    const isChildFieldsValid = Object.values(formValidatesMap.current)
      .map(validate => validate())
      .every(i => i);
    if (!isChildFieldsValid || !formArray.validate()) return;
    formArray.submit();
  };

  const situationsInfo = AVAILABLE_SITUATIONS_INFO_MAP[situation];

  if (!situationsInfo) return null;

  return (
    <FormStep
      onNext={handleSubmit}
      onBack={goBack}
    >

      {formArray.forms.map((form, i) => (
        <FormBlock
          key={form.id}
          title={t(situationsInfo.titleKey, { index: i + 1 })}
          icon={formArray.forms.length > 1 ? 'delete' : undefined}
          onAction={() => formArray.removeForm(form.id)}
        >
          <CallDataForm
            key={form.id}
            abiName={situationsInfo.abiName}
            availableFunctions={situationsInfo.functions}
            formValidatesMap={formValidatesMap}
            formId={form.id}
            onChange={form.onChange}
          />
        </FormBlock>
      ))}

      {formArray.forms.length < MAX_UPGRADES_COUNT && (
        <Button
          look="ghost"
          onClick={formArray.appendForm}
        >
          <Icon name="add" />
          <span>{t('ADD_UPGRADE')}</span>
        </Button>
      )}
    </FormStep>
  );
}

export default CallDataStep;
