import { gql } from 'graphql-request';

export const HISTORY_ITEMS_QUERY = gql`
  query HistoryItems($first: Int!, $from: Int!) {
    reserveParamsHistoryItems(
      first: $first
      orderBy: timestamp
      where: { timestamp_gte: $from }
    ) {
      id
      reserve {
        id
        symbol
        pool {
          id
        }
      }
      liquidityIndex
      variableBorrowIndex
      utilizationRate
      stableBorrowRate
      timestamp
    }
  }
`;
