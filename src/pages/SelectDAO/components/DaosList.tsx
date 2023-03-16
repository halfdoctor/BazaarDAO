
import { useTranslation } from 'react-i18next';

import { media } from '@q-dev/q-ui-kit';
import daos from 'json/daos.json';
import styled from 'styled-components';

import DaoCard from './DaoCard';

const StyledWrapper = styled.div`
  display: grid;
  gap: 16px;

  .daos-list__items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;

    ${media.lessThan('large')} {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
`;

function DaosList () {
  const { t } = useTranslation();

  return (
    <StyledWrapper>
      <h3 className="text-h3">{t('DAO_EXPLORE')}</h3>
      <div className="daos-list__items">
        {daos.map((dao, index) => (
          <DaoCard key={index} card={dao} />
        ))}
      </div>
    </StyledWrapper>
  );
}

export default DaosList;
