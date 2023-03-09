import { gql } from '@apollo/client';

export const GET_VERIFIED_CONTRACTS_QUERY = gql`
  query GetVerifiedContracts($addresses: [AddressHash] = []) {
    addresses(hashes: $addresses) {
      hash
      smartContract { name }
    }
  }
`;

export type GetVerifiedContractsData = {
  addresses?: {
    hash: string;
    smartContract?: { name: string };
  }[];
};
