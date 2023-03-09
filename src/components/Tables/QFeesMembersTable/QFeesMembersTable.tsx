import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ExplorerAddress from 'components/Custom/ExplorerAddress';
import Table from 'components/Table';

import { useExperts } from 'store/experts/hooks';

function QFeesMembersTable () {
  const { t } = useTranslation();
  const {
    epqfiMembers,
    epqfiMembersLoading,
    epqfiMembersError,
    getEpqfiMembers
  } = useExperts();

  useEffect(() => {
    getEpqfiMembers();
  }, []);

  return (
    <div className="block">
      <div className="block__header">
        <h3 className="text-h3">
          {t('LIST_OF_Q_FEES_INCENTIVES_EXPERTS')}
        </h3>
      </div>

      <div className="block__content">
        <Table
          tiny
          emptyTableMessage={t('NO_Q_FEES_INCENTIVES_MEMBERS')}
          loading={epqfiMembersLoading}
          error={epqfiMembersError}
          perPage={10}
          columns={[
            {
              dataField: 'member',
              text: t('MEMBER_ADDRESS'),
            },
          ]}
          table={epqfiMembers.map((member, idx) => ({
            id: idx,
            member: (
              <ExplorerAddress
                iconed
                semibold
                address={member}
              />
            ),
          }))}
        />
      </div>
    </div>
  );
}

export default QFeesMembersTable;
