import { useAlert } from 'react-alert';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

import { useForm } from '@q-dev/form-hooks';
import { Icon, media } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

import Button from 'components/Button';
import Input from 'components/Input';

import useDao from 'hooks/useDao';

import { address, required } from 'utils/validators';

const WrapContainer = styled.form`
  display: grid;
  align-items: flex-start;
  width: 100%;
  grid-template-columns: 540px max-content;
  gap: 15px;
  padding: 24px;

  .dao-address-form__btn { 
    margin-top: 40px;
  }

  ${media.lessThan('medium')} {
    grid-template-columns: 380px max-content;
  }

  ${media.lessThan('tablet')} {
    grid-template-columns: 1fr;

    .dao-address-form__btn { 
      margin-top: 0;
      width: 100%;
    }
  }
`;

function DaoAddressForm () {
  const { t } = useTranslation();
  const { searchDaoAddress } = useDao();
  const history = useHistory();
  const alert = useAlert();

  const form = useForm({
    initialValues: { address: '' },
    validators: { address: [required, address] },
    onSubmit: async (form) => {
      const isDaoExist = await searchDaoAddress(form.address);
      isDaoExist
        ? history.push(`${form.address}/dashboard`)
        : alert.error(t('WRONG_DAO_ADDRESS'));
    }
  });

  return (
    <WrapContainer
      noValidate
      className="block"
      onSubmit={form.submit}
    >
      <Input
        {...form.fields.address}
        alwaysEnabled
        label={t('INPUT_DAO_ADDRESS')}
        placeholder={t('ADDRESS_PLACEHOLDER')}
      />

      <Button
        type="submit"
        disabled={!form.isValid}
        className="dao-address-form__btn"
      >
        <Icon name="search" />
        <span>{t('FIND_DAO')}</span>
      </Button>
    </WrapContainer>
  );
}

export default DaoAddressForm;
