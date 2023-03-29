
import { useEffect, useState } from 'react';

import { DAO_MAIN_PANEL_NAME } from '@q-dev/gdk-sdk';
import { Spinner } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import ExplorerAddress from 'components/Custom/ExplorerAddress';

import { useExpertPanels } from 'store/expert-panels/hooks';

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
  name: string;
}

function ExpertPanelBlock ({ name }: Props) {
  const { getPanelMembers } = useExpertPanels();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    loadPanelMembers();
  }, [name]);

  async function loadPanelMembers () {
    setLoading(true);
    const members = await getPanelMembers(name);
    setMembers(members);
    setLoading(false);
  }

  return (
    <StyledWrapper className="block">
      <div className="expert-panel-block__header block__header">
        <h3 className="text-h3">
          {name === DAO_MAIN_PANEL_NAME
            ? 'DAO Constitution Panel'
            : `${name} Panel`
          }
        </h3>
      </div>

      <div className="block__content">
        {loading
          ? (
            <div className="expert-panel-block__loading-wrp">
              <Spinner size={96} thickness={4} />
            </div>
          )
          : members.length > 0
            ? (
              <div className="expert-panel-block__list">
                {members.map((address) => (
                  <div key={address} className="expert-panel-block__list-item">
                    <ExplorerAddress
                      semibold
                      iconed
                      className="text-md"
                      address={address}
                      iconSize={16}
                    />
                  </div>
                ))}
              </div>
            )
            : <p className="text-sm">No members</p>
        }
      </div>
    </StyledWrapper>
  );
}

export default ExpertPanelBlock;
