import { IntegrationConfig } from '../src/types';

// TODO use polly matching to find/replace configuration variables in files
// in order to allow multiple devs to generate recordings & test files.
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'a76fc728-0cba-45f0-a9eb-d45207e14513',
  subscriptionId: 'dccea45f-7035-4a17-8731-1fd46aaa74a0',
};

export default config;
