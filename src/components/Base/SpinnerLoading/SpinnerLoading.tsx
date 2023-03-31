
import { Spinner } from '@q-dev/q-ui-kit';
import styled from 'styled-components';

export const SpinnerLoadingWrapper = styled.div`
  position: absolute;
  left: 50%;
  display: flex;
  align-items: center;
  height: 50vh;
`;

function SpinnerLoading ({ size = 48 }: { size?: number }) {
  return (
    <SpinnerLoadingWrapper>
      <Spinner size={size} />
    </SpinnerLoadingWrapper>
  );
}

export default SpinnerLoading;
