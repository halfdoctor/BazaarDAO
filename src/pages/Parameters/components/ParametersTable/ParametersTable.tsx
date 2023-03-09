import { useTranslation } from 'react-i18next';

import { calculateInterestRate, formatAsset, formatFactor, formatFraction, formatNumber } from '@q-dev/utils';
import parametersJson from 'json/parameters.json';
import { ParameterValue } from 'typings/parameters';
import { fromWei } from 'web3-utils';

import CopyToClipboard from 'components/CopyToClipboard';
import ExplorerAddress from 'components/Custom/ExplorerAddress';

import { TableWrapper } from './styles';

import { formatDuration } from 'utils/date';

const parametersDictionary = parametersJson as {
  [key: string]: {
    type: string;
  };
};

interface Props {
  parameters: ParameterValue[];
  simplified: boolean;
}

function ParametersTable ({ parameters, simplified }: Props) {
  const { t } = useTranslation();

  const renderKey = (item: ParameterValue) => {
    return simplified
      ? t(item.key)
      : (
        <div>
          <span>{item.key}</span>
          <CopyToClipboard value={item.key} />
        </div>
      );
  };

  const renderValue = (item: ParameterValue) => {
    const type = parametersDictionary[item.key]?.type;
    if (type === 'address' || item.type === 'Addr') {
      return (
        <ExplorerAddress
          short={simplified}
          address={item.value}
        />
      );
    }

    if (!simplified) {
      return (
        <div>
          <span>{item.value}</span>
          <CopyToClipboard value={item.value} />
        </div>
      );
    }

    switch (type) {
      case 'number':
        return formatNumber(item.value);
      case 'factor':
        return formatFactor(item.value);
      case 'period':
        return formatDuration(item.value);
      case 'fraction':
        return formatFraction(item.value);
      case 'rate':
        return `${formatNumber(calculateInterestRate(Number(item.value)), 2)} %`;
      case 'gas':
        return `${formatNumber(item.value, 2)} ${t('GAS')}`;
      case 'Q':
      case 'QUSD':
        return formatAsset(fromWei(item.value), type);
      default:
        return item.value;
    }
  };

  return (
    <TableWrapper $simplified={simplified}>
      <table>
        <tbody>
          {parameters.map((item, index) => (
            <tr key={item.key + index}>
              <td>{renderKey(item)}</td>
              <td>{renderValue(item)}</td>
              {!simplified && <td>{item.type.toUpperCase()}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

export default ParametersTable;
