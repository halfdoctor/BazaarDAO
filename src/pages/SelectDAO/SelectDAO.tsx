import { useTranslation } from 'react-i18next';

import PageLayout from 'components/PageLayout';

import DaoAddressForm from './components/DaoAddressForm';
// import DaosList from './components/DaosList';

function SelectDao () {
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t('DAOS_TITLE')}
    >
      <DaoAddressForm />
<a
        href="/0x6c9269258c8518E9F85409C5fF93193413a9E451/"
        target="_blank"
        rel="noopener noreferrer"
      >
        The Bazaar
      </a>
      {/* TODO: to activate `DaosList` when the real DAOs show up. */}
      {/* <DaosList /> */}
    </PageLayout>
  );
}

export default SelectDao;
