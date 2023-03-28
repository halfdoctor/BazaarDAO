import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

import { useExpertPanels } from 'store/expert-panels/hooks';
import { useProposals } from 'store/proposals/hooks';

const StyledWrapper = styled.div`
  padding: 24px 16px 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .total-expert-panels__val {
    margin-top: 4px;
  }

  .total-expert-panels__proposals {
    margin-top: 16px;
  }
`;

function TotalExpertPanels () {
  const { t } = useTranslation();
  const { panels } = useExpertPanels();
  const { activeProposalsCount } = useProposals();
  // const {
  //   validators,
  //   inactiveValidatorsCount,
  //   inactiveValidatorsCountLoading,
  //   loadInactiveValidatorsCount,
  // } = useValidators();

  // const validatorsRef = useAnimateNumber(validators.length, ' ', val => formatNumber(val, 0));

  // useEffect(() => {
  //   loadInactiveValidatorsCount(indexerUrl);
  // }, []);

  return (
    <StyledWrapper className="block">
      <div>
        <h2 className="text-lg">{t('TOTAL_EXPERT_PANELS')}</h2>
        <p className="total-expert-panels__val text-xl font-semibold">{panels.length}</p>
        <p className="total-expert-panels__proposals text-sm">
          <span className="font-light">Active proposals: </span>
          <span>{activeProposalsCount}</span>
        </p>
      </div>
    </StyledWrapper>
  );
}

export default TotalExpertPanels;
