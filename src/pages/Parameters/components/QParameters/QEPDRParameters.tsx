import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

import DeFiMembersTable from 'components/Tables/DeFiMembersTable';

import ParametersBlock from '../ParametersBlock';

import { useParameters } from 'store/parameters/hooks';

import { getEpdrParametersInstance } from 'contracts/contract-instance';
import { getContractOwner } from 'contracts/helpers/parameters-helper';

const StyledWrapper = styled.div`
  display: grid;
  gap: 24px;
`;

function QEPDRParameters () {
  const { t } = useTranslation();
  const {
    epdrParameters,
    epdrParametersLoading,
    epdrParametersError,
    getEpdrParameters
  } = useParameters();

  const [ePDRParametersAddress, setEPDRParametersAddress] = useState('0x00');
  const [tokenBridgeAdminProxy, setTokenBridgeAdminProxy] = useState('');

  useEffect(() => {
    getEpdrParameters();
    getContractOwner('tokenBridgeAdminProxy').then(setTokenBridgeAdminProxy);
    getEpdrParametersInstance().then((contract) => setEPDRParametersAddress(contract.address));

    return () => {
      setEPDRParametersAddress('0x00');
      setTokenBridgeAdminProxy('');
    };
  }, []);

  return (
    <StyledWrapper>
      <ParametersBlock
        title={t('Q_DEFI_RISK_EXPERT_PANEL_PARAMETERS')}
        subtitle={`(${ePDRParametersAddress})`}
        docsId="#q-defi-risk-expert-panel-epdr-parameters"
        parameters={epdrParameters}
        gnosisSafeAddress={tokenBridgeAdminProxy}
        loading={epdrParametersLoading}
        errorMsg={epdrParametersError}
      />

      <DeFiMembersTable />
    </StyledWrapper>
  );
}

export default QEPDRParameters;
