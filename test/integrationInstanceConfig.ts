import { IntegrationConfig } from '../src/types';

const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId:
    process.env.DIRECTORY_ID || 'a76fc728-0cba-45f0-a9eb-d45207e14513',
  subscriptionId:
    process.env.SUBSCRIPTION_ID || 'dccea45f-7035-4a17-8731-1fd46aaa74a0',
};

export default config;
