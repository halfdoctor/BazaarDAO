
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
            <tr key={item.key + index}>
              <td>
                <span>{item.key}</span>
                <CopyToClipboard value={item.key} />
              </td>
              <td>
                {item.type === 'Addr'
                  ? <ExplorerAddress address={item.value} />
                  : (
                    <>
                      <span>{item.value}</span>
                      <CopyToClipboard value={item.value} />
                    </>
                  )
                }
              </td>
              <td>{item.type.toUpperCase()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );
}

export default ParametersTable;
