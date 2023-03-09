
import { useTranslation } from 'react-i18next';

import PageLayout from 'components/PageLayout';

function Dashboard () {
  const { t } = useTranslation();

  return (
    <PageLayout title={t('DASHBOARD')} />
  );
}

export default Dashboard;
