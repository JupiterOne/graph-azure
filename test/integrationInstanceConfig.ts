import { IntegrationConfig } from '../src/types';
import * as dotenv from 'dotenv';
import * as path from 'path';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

// TODO use polly matching to find/replace configuration variables in files
// in order to allow multiple devs to generate recordings & test files.
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'a76fc728-0cba-45f0-a9eb-d45207e14513',
  subscriptionId: 'dccea45f-7035-4a17-8731-1fd46aaa74a0',
};

export default config;

/**
 * We should move this project to completely matchable API calls, and thus,
 * should be using this version of the config for all tests. We will need to
 * maintain the above `config` until the entire project as been transitioned
 * to this `configFromEnv`, at which time the above can be removed.
 */
export const configFromEnv: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: process.env.DIRECTORY_ID || 'directoryId',
  subscriptionId: process.env.SUBSCRIPTION_ID || 'subscriptionId',
};
