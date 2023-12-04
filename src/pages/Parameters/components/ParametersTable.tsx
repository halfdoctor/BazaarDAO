import { useTranslation } from 'react-i18next';

import { ParameterType, VotingType } from '@q-dev/gdk-sdk';
import { formatAsset, formatNumber, formatPercent } from '@q-dev/utils';
import { ErrorHandler } from 'helpers';
import styled from 'styled-components';
import { ParameterValue } from 'typings/parameters';

import CopyToClipboard from 'components/CopyToClipboard';
import ExplorerAddress from 'components/Custom/ExplorerAddress';

import useParameterTypes from 'hooks/useParameterTypes';

import { useDaoTokenStore } from 'store/dao-token/hooks';

import { VOTING_TYPE_TRANSLATION_KEY_MAP } from 'constants/proposal';
import { formatDuration } from 'utils/date';
import { fromWeiWithDecimals, } from 'utils/numbers';

export const TableWrapper = styled.div`
  overflow-x: auto;
  
  table {
    width: 100%;
  }

  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSecondary};
  }

  th {
    padding: 7px 5px;
  }

  td {
    padding: 7px 5px;
    white-space: nowrap;
  }

  .parameter-key-cell {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .parameter-key-copy {
    padding: 0;
  }
`;

type ParamNormalType = 'period' | 'percent' | 'voting-type' | 'system-token-amount';

interface Props {
  parameters: ParameterValue[];
  simplified?: boolean;
}

const PART_OF_PARAMS_KEYS_OF_TIME = [
  'votingPeriod',
  'appealPeriod',
  'vetoPeriod',
  'proposalExecutionPeriod',
];

const PART_OF_PARAMS_KEYS_OF_PERCENT = [
  'requiredQuorum',
  'requiredMajority',
  'requiredVetoQuorum'
];

function getParamNormalType (name: string): ParamNormalType | undefined {
  if (name.includes('.votingType')) return 'voting-type';
  if (name.includes('.votingMinAmount')) return 'system-token-amount';

  const isTime = PART_OF_PARAMS_KEYS_OF_TIME.some((i) => name.includes(`.${i}`));
  if (isTime) return 'period';
  const isPercent = PART_OF_PARAMS_KEYS_OF_PERCENT.some((i) => name.includes(`.${i}`));
  if (isPercent) return 'percent';
}

function ParametersTable ({ parameters, simplified }: Props) {
  const { t } = useTranslation();
  const { translateParameterType } = useParameterTypes();
  const { tokenInfo } = useDaoTokenStore();

  const renderValue = (item: ParameterValue) => {
    if (item.solidityType === ParameterType.ADDRESS) {
      return (
        <ExplorerAddress
          short={simplified}
          address={item.normalValue}
        />
      );
    }

    if (!simplified) {
      return (
        <div>
          <span>{item.normalValue}</span>
          <CopyToClipboard value={item.normalValue} />
        </div>
      );
    }

    const normalType = getParamNormalType(item.name);

    try {
      switch (normalType) {
        case 'period':
          return formatDuration(item.normalValue);
        case 'percent':
          return formatPercent(fromWeiWithDecimals(item.normalValue, 25));
        case 'voting-type':
          return t(VOTING_TYPE_TRANSLATION_KEY_MAP[Number(item.normalValue) as VotingType]);
        case 'system-token-amount':
          if (!tokenInfo) return item.normalValue;

          return ['erc721', 'erc5484'].includes(tokenInfo.type)
            ? formatAsset(item.normalValue, tokenInfo.symbol)
            : `${formatNumber(fromWeiWithDecimals(item.normalValue, tokenInfo.decimals), tokenInfo.decimals)} ${tokenInfo.symbol}`;
        default:
          return item.normalValue;
      }
    } catch (err) {
      ErrorHandler.processWithoutFeedback(err);
      return item.normalValue;
    }
  };

  return (
    <TableWrapper>
      <table>
        <thead>
          <tr>
            <th className="text-md font-bold">{t('KEY')}</th>
            <th className="text-md font-bold">{t('VALUE')}</th>
            {!simplified && (
              <th className="text-md font-bold">{t('TYPE')}</th>
            )}
          </tr>
        </thead>

        <tbody>
          {parameters.map((item, index) => (
            <tr key={item.name + index}>
              <td className="text-md">
                <span>{item.name}</span>
                <CopyToClipboard value={item.name} />
              </td>
              <td className="text-md">
                {renderValue(item)}
              </td>
              {!simplified && (
                <td className="text-md">
                  {translateParameterType(item.solidityType)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

export default ParametersTable;
