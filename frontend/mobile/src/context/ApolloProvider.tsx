import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../services/apollo';

interface Props {
  children: React.ReactNode;
}

export default function ApolloProviderWrapper({ children }: Props) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}