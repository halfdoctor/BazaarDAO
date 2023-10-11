import { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Form, useForm } from '@q-dev/form-hooks';
import { getDecodeData } from '@q-dev/gdk-sdk';
import { Select, Switch } from '@q-dev/q-ui-kit';
import styled from 'styled-components';
import { CallDataProposalForm, FormValidatesMap } from 'typings/forms';

import Textarea from 'components/Textarea';

import FunctionArgsForm from './FunctionArgsForm';

import { callData, required } from 'utils/validators';

interface Props {
  formId: string;
  formValidatesMap: MutableRefObject<FormValidatesMap>;
  abiName: string;
  availableFunctions: string[];
  onChange: (form: Form<CallDataProposalForm>) => void;
}

export const CallDataFormContainer = styled.div`
  display: grid;
  gap: 16px;
`;

function CallDataForm ({ onChange, formValidatesMap, formId, abiName, availableFunctions }: Props) {
  const { t } = useTranslation();
  const [isRawMode, setIsRawMode] = useState(false);

  const form = useForm({
    initialValues: {
      functionName: '',
      callData: '',
    },
    validators: {
      functionName: [required],
      callData: [required, callData({
        functionNames: availableFunctions,
        abiName: abiName,
      })],
    },
  });

  const functionNameOptions = useMemo(() => {
    return availableFunctions.map((name) => ({
      label: name,
      value: name
    }));
  }, [availableFunctions]);

  const decodedCallData = useMemo(() => {
    try {
      if (!form.validateByKey('callData', true)) return null;
      const decodedData = getDecodeData(abiName, form.values.callData);

      if (!decodedData) return null;

      return functionNameOptions.some(({ value }) => value === decodedData?.functionName)
        ? decodedData
        : null;
    } catch (e) {
      return null;
    }
  }, [form.values.callData, functionNameOptions, abiName]);

  useEffect(() => {
    if (isRawMode) {
      if (decodedCallData) {
        form.fields.functionName.onChange(decodedCallData?.functionName || '');
      } else if (form.values.functionName) {
        form.fields.functionName.onChange('');
      }
    }
  }, [form.values.functionName, decodedCallData, isRawMode]);

  useEffect(() => {
    onChange(form);
  }, [form.values, onChange]);

  return (
    <CallDataFormContainer>
      <Switch
        value={isRawMode}
        label={t('RAW_MODE')}
        onChange={() => setIsRawMode(!isRawMode)}
      />

      {
        isRawMode
          ? <Textarea
            {...form.fields.callData}
            label={t('CALL_DATA')}
            maxLength={1000}
          />
          : <>
            <Select
              {...form.fields.functionName}
              label={t('FUNCTION')}
              placeholder={t('FUNCTION')}
              options={functionNameOptions}
            />
            <FunctionArgsForm
              key={form.values.functionName}
              formId={formId}
              formValidatesMap={formValidatesMap}
              functionName={form.values.functionName}
              setCallData={form.fields.callData.onChange}
              decodedCallData={decodedCallData}
              abiName={abiName}
            />
          </>
      }
    </CallDataFormContainer>
  );
}

export default CallDataForm;
