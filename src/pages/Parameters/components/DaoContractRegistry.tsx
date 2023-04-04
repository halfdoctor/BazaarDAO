import { useTranslation } from 'react-i18next';

function DaoContractRegistry () {
  const { t } = useTranslation();
  // const {
  //   contractRegistry,
  //   contractRegistryLoading,
  //   contractRegistryError,
  //   getContractRegistry
  // } = useParameters();
  // useEffect(() => {
  //   getContractRegistry();
  // }, []);

  // return (
  //   <ParametersBlock
  //     title={t('DAO_CONTRACT_REGISTRY')}
  //     parameters={contractRegistry}
  //     loading={contractRegistryLoading}
  //     errorMsg={contractRegistryError}
  //     emptyMsg={t('DAO_CONTRACT_REGISTRY_EMPTY_MSG')}
  //   />
  // );

  return null;
}

export default DaoContractRegistry;
