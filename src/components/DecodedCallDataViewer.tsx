import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DefaultVotingSituations, getDecodeData } from '@q-dev/gdk-sdk';
import startCase from 'lodash/startCase';
import styled, { css } from 'styled-components';

import { ABI_NAME_BY_SITUATION_MAP } from 'constants/proposal';

interface Props {
  callData: string;
  index: number;
  votingSituation: string;
  block?: boolean;
}

export const DecodedCallDataViewerContainer = styled.div<{ $block: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 16px 16px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSecondary};

  ${({ $block }) => $block && css`
    padding: 24px;
    border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
    border-radius: 8px;
  `}
`;

function DecodedCallDataViewer ({
  callData,
  index,
  votingSituation,
  block = false,
}: Props) {
  const { t } = useTranslation();

  const header = useMemo(() => {
    switch (votingSituation) {
      case DefaultVotingSituations.PermissionManager:
        return t('PERMISSION_INDEX', { index: index + 1 });
      case DefaultVotingSituations.DAORegistry:
        return t('UPGRADE_INDEX', { index: index + 1 });
      default:
        return t('UPDATE_INDEX', { index: index + 1 });
    }
  }, [votingSituation, index, t]);

  const decodedCallData = useMemo(() => {
    try {
      const abiName = ABI_NAME_BY_SITUATION_MAP[votingSituation as DefaultVotingSituations];
      if (!callData || !abiName) return null;

      const data = getDecodeData(abiName, callData);

      if (!data) return null;

      return {
        functionLabel: t('FUNCTION'),
        functionName: data?.functionName,
        args: Object.entries(data.arguments).map(([key, value]) => ({
          label: startCase(key),
          value: String(value)
        }))
      };
    } catch (e) {
      return null;
    }
  }, [callData, t]);

  const isValidCallData = Boolean(decodedCallData);

  return (
    <DecodedCallDataViewerContainer $block={block}>
      <p className={'text-lg font-semibold'}>
        {header}
      </p>

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
              <p className="text-lg break-word">
                {value}
              </p>
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
