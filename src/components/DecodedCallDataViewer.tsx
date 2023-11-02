import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations, getDecodeData, getDecodeDataByABI } from '@q-dev/gdk-sdk';
import startCase from 'lodash/startCase';
import styled, { css } from 'styled-components';

import { ABI_NAME_BY_SITUATION_MAP } from 'constants/proposal';

type Scheme = 'block' | 'top-border';

interface Props {
  callData: string;
  index?: number;
  votingSituation: string;
  abi?: string[];
  scheme?: Scheme;
  withoutHeader?: boolean;
}

export const DecodedCallDataViewerContainer = styled.div<{ $scheme?: Scheme }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  ${({ $scheme }) => {
    switch ($scheme) {
      case 'block':
        return css`
          padding: 24px;
          border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
          border-radius: 8px;
          height: 100%;
        `;
      case 'top-border':
        return css`
          padding: 16px 16px 0;
          border-top: 1px solid ${({ theme }) => theme.colors.borderSecondary};
        `;
    }
  }}

  .decoded-call-data-viewer__values-list {
    list-style-position: inside;
  }

  .decoded-call-data-viewer__values-list-item {
    word-break: break-all;
  }
`;

function DecodedCallDataViewer ({
  callData,
  index,
  votingSituation,
  abi,
  scheme,
  withoutHeader,
}: Props) {
  const { t } = useTranslation();

  const header = useMemo(() => {
    if (withoutHeader) return '';

    switch (votingSituation) {
      case DefaultVotingSituations.PermissionManager:
        return t('PERMISSION_INDEX', { index });
      case DefaultVotingSituations.DAORegistry:
        return t('UPGRADE_INDEX', { index });
      default:
        return t('UPDATE_INDEX', { index });
    }
  }, [votingSituation, index, withoutHeader, t]);

  const decodedCallData = useMemo(() => {
    try {
      const abiName = ABI_NAME_BY_SITUATION_MAP[votingSituation as DefaultVotingSituations];

      if (!callData || (!abi?.length && !abiName)) return null;

      const data = abiName
        ? getDecodeData(abiName, callData)
        : getDecodeDataByABI(abi, callData);

      if (!data) return null;

      return {
        functionLabel: t('FUNCTION'),
        functionName: data?.functionName,
        args: Object.entries(data.arguments).map(([key, value]) => ({
          label: startCase(key),
          value: value
        }))
      };
    } catch (e) {
      return null;
    }
  }, [callData, t]);

  const isValidCallData = Boolean(decodedCallData);

  return (
    <DecodedCallDataViewerContainer $scheme={scheme}>
      {!withoutHeader && (
        <p className={'text-lg font-semibold'}>
          {header}
        </p>
      )}

      {isValidCallData && (
        <>
          <div>
            <p className="text-md color-secondary">{decodedCallData?.functionLabel}</p>
            <p className="text-lg break-word">
              {decodedCallData?.functionName}
            </p>
          </div>

          {decodedCallData?.args.map(({ label, value }, index) => (
            <div key={index}>
              <p className="text-md color-secondary">{label}</p>
              {Array.isArray(value)
                ? (<ol className="decoded-call-data-viewer__values-list">
                  {value.map((valItem, valIndex) => (
                    <li key={valIndex} className="decoded-call-data-viewer__values-list-item text-lg">
                      {valItem?.toString()}
                    </li>
                  ))}
                </ol>)
                : (<p className="text-lg break-word">
                  {value?.toString()}
                </p>)
              }
            </div>
          ))}
        </>
      )}
      <div>
        <p className="text-md color-secondary">
          {isValidCallData ? t('CALL_DATA') : t('INVALID_CALL_DATA')}
        </p>
        <p className="text-sm break-word">
          {callData}
        </p>
      </div>
    </DecodedCallDataViewerContainer>
  );
}

export default DecodedCallDataViewer;
