import { useTranslation } from 'react-i18next';

import { ParameterType } from '@q-dev/gdk-sdk';
import styled from 'styled-components';
import { ParameterValue } from 'typings/parameters';

import CopyToClipboard from 'components/CopyToClipboard';
import ExplorerAddress from 'components/Custom/ExplorerAddress';

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

interface Props {
  parameters: ParameterValue[];
}

function ParametersTable ({ parameters }: Props) {
  const { t } = useTranslation();
  const parameterTypeMap = {
    [ParameterType.NONE]: t('NONE'),
    [ParameterType.ADDRESS]: t('ADDRESS'),
    [ParameterType.UINT256]: t('UINT'),
    [ParameterType.STRING]: t('STRING'),
    [ParameterType.BYTES]: t('BYTES'),
    [ParameterType.BOOL]: t('BOOLEAN'),
  };

  return (
    <TableWrapper>
      <table>
        <thead>
          <tr>
            <th className="text-md font-bold">{t('KEY')}</th>
            <th className="text-md font-bold">{t('VALUE')}</th>
            <th className="text-md font-bold">{t('TYPE')}</th>
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
                {item.solidityType === ParameterType.ADDRESS
                  ? <ExplorerAddress address={item.normalValue} />
                  : (
                    <>
                      <span>{item.normalValue}</span>
                      <CopyToClipboard value={item.normalValue} />
                    </>
                  )
                }
              </td>
              <td className="text-md">
                {parameterTypeMap[item.solidityType] || item.solidityType}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

export default ParametersTable;
