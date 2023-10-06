import { HTMLAttributes, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DecodedData } from '@q-dev/gdk-sdk';
import styled from 'styled-components';

import useParameterTypes from 'hooks/useParameterTypes';

interface Props extends HTMLAttributes<HTMLDivElement> {
  decodedCallData: DecodedData;
}

export const ParamsItemContainer = styled.div`
  .params-list__item {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    border-top: 1px solid ${({ theme }) => theme.colors.borderSecondary};
    padding: 24px;
    border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
    border-radius: 8px;
  }
`;

function ParamsList ({ decodedCallData, className }: Props) {
  const { t } = useTranslation();
  const { translateParameterType } = useParameterTypes();

  const params = useMemo(() => {
    if (!decodedCallData.arguments || !Array.isArray(decodedCallData.arguments)) return [];

    return decodedCallData.arguments.map((param) => ({
      name: param?.name,
      type: param?.solidityType,
      value: param?.value
    }));
  }, [decodedCallData]);

  return (
    <ParamsItemContainer className={className}>
      <h3 className="text-h3">{t('PARAMETERS')}</h3>

      <div className="block__content">
        <div className="details-list">
          {params.map((callData, i) => (
            <div key={i} className="params-list__item">
              <p className={'text-lg font-semibold'}>
                {t('PARAMETER_INDEX', { index: i + 1 })}
              </p>

              <div>
                <p className="text-md color-secondary">
                  {t('KEY')}
                </p>
                <p className="text-lg break-word">
                  {callData.name ?? t('UNKNOWN')}
                </p>
              </div>

              <div>
                <p className="text-md color-secondary">
                  {t('TYPE')}
                </p>
                <p className="text-lg break-word">
                  {translateParameterType(callData.type).toUpperCase()}
                </p>
              </div>

              <div>
                <p className="text-md color-secondary">
                  {t('VALUE')}
                </p>
                <p className="text-lg break-word">
                  {callData.value ?? t('UNKNOWN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ParamsItemContainer>
  );
}

export default ParamsList;
