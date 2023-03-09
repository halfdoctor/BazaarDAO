import { HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { ParameterType } from '@q-dev/q-js-sdk';
import { Tip } from '@q-dev/q-ui-kit';
import { FormParameter } from 'typings/forms';

import { ParameterViewerContainer } from './styles';

interface Props extends HTMLAttributes<HTMLDivElement> {
  parameter: FormParameter;
  index: number;
  block?: boolean;
}

function ParameterViewer ({
  parameter,
  index,
  block = false,
  ...rest
}: Props) {
  const { t } = useTranslation();

  const parameterTypesMap: Record<ParameterType, string> = {
    [ParameterType.NONE]: '–',
    [ParameterType.ADDRESS]: 'ADDRESS',
    [ParameterType.BOOL]: 'BOOLEAN',
    [ParameterType.STRING]: 'STRING',
    [ParameterType.UINT]: 'UINT',
    [ParameterType.BYTE]: 'BYTE',
  };

  return (
    <ParameterViewerContainer $block={block} {...rest}>
      <p className={block ? 'text-lg font-semibold' : 'text-md'}>
        {t('PARAMETER_INDEX', { index: index + 1 })}
      </p>

      {parameter.isNew && (
        <Tip type="warning">
          {t('GOING_TO_CREATE_A_NEW_PARAMETER')}
        </Tip>
      )}

      <div>
        <p className="text-md color-secondary">{t('KEY')}</p>
        <p className="text-lg break-word" title={parameter.key}>
          {parameter.key}
        </p>
      </div>

      <div>
        <p className="text-md color-secondary">{t('VALUE')}</p>
        <p className="text-lg break-word" title={parameter.value}>
          <span>{String(parameter.value)}</span>
          <span className="font-light color-secondary" style={{ marginLeft: '4px' }}>
            {parameterTypesMap[parameter.type]}
          </span>
        </p>
      </div>
    </ParameterViewerContainer>
  );
}

export default ParameterViewer;
