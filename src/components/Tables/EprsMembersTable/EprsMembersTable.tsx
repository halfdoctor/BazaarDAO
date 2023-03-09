import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ExplorerAddress from 'components/Custom/ExplorerAddress';
import Table from 'components/Table';

import { useExperts } from 'store/experts/hooks';

function EprsMembersTable () {
  const { t } = useTranslation();
  const {
    eprsMembers,
    eprsMembersLoading,
    eprsMembersError,
    getEprsMembers
  } = useExperts();

  useEffect(() => {
    getEprsMembers();
  }, []);

  return (
    <div className="block">
      <div className="block__header">
        <h3 className="text-h3">{t('LIST_OF_ROOT_NODE_SELECTION_EXPERTS')}</h3>
      </div>

      <div className="block__content">
        <Table
          tiny
          emptyTableMessage={t('NO_ROOT_NODE_SELECTION_MEMBERS')}
          perPage={10}
          loading={eprsMembersLoading}
          error={eprsMembersError}
          columns={[
            {
              dataField: 'member',
              text: t('MEMBER_ADDRESS'),
            },
          ]}
          table={eprsMembers.map((member, idx) => ({
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

export default EprsMembersTable;
