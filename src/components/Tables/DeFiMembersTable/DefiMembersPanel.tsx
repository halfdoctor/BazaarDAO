import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ExplorerAddress from 'components/Custom/ExplorerAddress';
import Table from 'components/Table';

import { useExperts } from 'store/experts/hooks';

function DeFiMembersTable () {
  const { t } = useTranslation();
  const {
    epdrMembers,
    epdrMembersLoading,
    epdrMembersError,
    getEpdrMembers
  } = useExperts();

  useEffect(() => {
    getEpdrMembers();
  }, []);

  return (
    <div className="block">
      <div className="block__header">
        <h3 className="text-h3">
          <span>{t('LIST_OF_DEFI_EXPERTS')}</span>
        </h3>
      </div>

      <div className="block__content">
        <Table
          tiny
          emptyTableMessage={t('NO_DEFI_MEMBERS')}
          loading={epdrMembersLoading}
          error={epdrMembersError}
          perPage={10}
          columns={[
            {
              dataField: 'member',
              text: t('MEMBER_ADDRESS'),
            },
          ]}
          table={epdrMembers.map((member, idx) => ({
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

export default DeFiMembersTable;
