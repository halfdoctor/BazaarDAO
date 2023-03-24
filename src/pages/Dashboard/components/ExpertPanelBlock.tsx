
import { Spinner } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import ExplorerAddress from 'components/Custom/ExplorerAddress';

const StyledWrapper = styled.div`
  .expert-panel-block__header {
    margin-right: -8px;
  }

  .expert-panel-block__loading-wrp {
    display: grid;
    place-content: center;
    padding: 40px;
  }

  .expert-panel-block__list {
    display: grid;
    gap: 16px;
  }

  .expert-panel-block__list-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

interface Props {
  title: string;
}

function ExpertPanelBlock ({ title }: Props) {
  const loading = false;

  const items = [
    '0x1234567890123456789012345678901234567890',
    '0x1234567890123456789012345678901234567891',
    '0x1234567890123456789012345678901234567892',
  ];

  return (
    <StyledWrapper className="block">
      <div className="expert-panel-block__header block__header">
        <h3 className="text-h3">{title}</h3>
      </div>

      <div className="block__content">
        {loading
          ? (
            <div className="expert-panel-block__loading-wrp">
              <Spinner size={96} thickness={4} />
            </div>
          )
          : (
            <div className="expert-panel-block__list">
              {items.map((item) => (
                <div key={item} className="expert-panel-block__list-item">
                  <ExplorerAddress
                    semibold
                    iconed
                    className="text-md"
                    address={item}
                    iconSize={16}
                  />
                </div>
              ))}
            </div>
          )
        }
      </div>
    </StyledWrapper>
  );
}

export default ExpertPanelBlock;
