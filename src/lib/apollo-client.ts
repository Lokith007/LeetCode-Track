// lib/apollo-client.ts

import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://backend-leetcode.onrender.com/graphql',
  cache: new InMemoryCache(),
});

export default client;
