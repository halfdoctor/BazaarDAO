
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

  td {
    color: ${(props) => props.theme.colors.textPrimary};
    font-size: 13px;
    line-height: 18px;
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
  return (
    <TableWrapper>
      <table>
        <tbody>
          {parameters.map((item, index) => (
            <tr key={item.name + index}>
              <td>
                <span>{item.name}</span>
                <CopyToClipboard value={item.name} />
              </td>
              <td>
                {item.type === ParameterType.ADDRESS
                  ? <ExplorerAddress address={item.normalValue} />
                  : (
                    <>
                      <span>{item.normalValue}</span>
                      <CopyToClipboard value={item.normalValue} />
                    </>
                  )
                }
              </td>
              <td>{item.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

export default ParametersTable;
