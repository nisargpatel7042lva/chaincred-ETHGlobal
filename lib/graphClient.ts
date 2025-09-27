import { GraphQLClient } from "graphql-request";

export const endpoints = {
  blocks: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
  snapshot: "https://hub.snapshot.org/graphql",
  uniswap: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  compound: "https://api.thegraph.com/subgraphs/name/compound-finance/compound-v2",
};

export const graphClients = {
  blocks: new GraphQLClient(endpoints.blocks),
  snapshot: new GraphQLClient(endpoints.snapshot),
  uniswap: new GraphQLClient(endpoints.uniswap),
  compound: new GraphQLClient(endpoints.compound),
};

// Queries
export const GET_VOTES = `
  query GetVotes($voter: String!) {
    votes(where: { voter: $voter }) {
      id
      proposal { id title }
    }
  }
`;

export const GET_POSITIONS = `
  query GetPositions($user: String!) {
    positions(where: { owner: $user }) {
      id
      token0 { symbol }
      token1 { symbol }
      liquidity
    }
  }
`;

export const GET_COMPOUND_ACCOUNT = `
  query GetAccount($id: ID!) {
    account(id: $id) {
      tokens {
        symbol
        lifetimeSupplyInterestAccrued
        lifetimeBorrowInterestAccrued
      }
    }
  }
`;
