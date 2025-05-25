import { Amplify } from 'aws-amplify';

Amplify.configure({
  aws_appsync_graphqlEndpoint: 'https://ts6p6odadfbw5jv5zjsskxbfxa.appsync-api.us-east-1.amazonaws.com/graphql',
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: 'da2-nfdgb2hqcbeqpf4uk4y7v6lf2y',
});