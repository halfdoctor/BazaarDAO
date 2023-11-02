import { HTMLAttributes, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DecodedData, DefaultVotingSituations } from '@q-dev/gdk-sdk';
import styled from 'styled-components';

import DecodedCallDataViewer from 'components/DecodedCallDataViewer';

interface Props extends HTMLAttributes<HTMLDivElement> {
  decodedCallData: DecodedData;
  votingSituation: string;
}

export const MultiCallListContainer = styled.div`
  .multi-call-list__item {
    display: grid;
    gap: 16px;
    padding: 16px 16px 0;
    border-top: 1px solid ${({ theme }) => theme.colors.borderSecondary};
    padding: 24px;
    border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
    border-radius: 8px;
  }
`;

function MultiCallList ({ decodedCallData, votingSituation, className }: Props) {
  const { t } = useTranslation();

  const decodedMulticallArgs = useMemo(() => {
    return decodedCallData.functionName === 'multicall' && Array.isArray(decodedCallData.arguments?.data)
      ? decodedCallData.arguments.data as string[]
      : [];
  }, [decodedCallData]);

  if (!decodedMulticallArgs.length) return null;

  const header = useMemo(() => {
    switch (votingSituation) {
      case DefaultVotingSituations.PermissionManager:
        return t('PERMISSIONS');
      case DefaultVotingSituations.DAORegistry:
        return t('UPGRADES');
      default:
        return t('UPDATES');
    }
  }, [votingSituation, t]);

  return (
    <MultiCallListContainer className={className}>
      <h3 className="text-h3">{header}</h3>

      <div className="block__content">
        <div className="details-list">
          {decodedMulticallArgs.map((item, index) => (
            <DecodedCallDataViewer
              key={index + 1}
              scheme="block"
              callData={item}
              votingSituation={votingSituation}
              index={index}
            />
          ))}
        </div>
      </div>
    </MultiCallListContainer>
  );
}

export default MultiCallList;
