// lib/apollo-client.ts

import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://backend-leetcode-production-880f.up.railway.app/',
  cache: new InMemoryCache(),
});

export default client;
