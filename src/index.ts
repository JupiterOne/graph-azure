import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import getStepStartStates from './getStepStartStates';
import { activeDirectorySteps } from './steps/active-directory';
import { computeSteps } from './steps/resource-manager/compute';
import { cosmosdbSteps } from './steps/resource-manager/cosmosdb';
import { databaseSteps } from './steps/resource-manager/databases';
import { interserviceSteps } from './steps/resource-manager/interservice';
import { keyvaultSteps } from './steps/resource-manager/key-vault';
import { networkSteps } from './steps/resource-manager/network';
import { authorizationSteps } from './steps/resource-manager/authorization';
import { IntegrationConfig } from './types';
import validateInvocation from './validateInvocation';
import { storageSteps } from './steps/resource-manager/storage';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields: {
    clientId: {
      type: 'string',
      mask: false,
    },
    clientSecret: {
      type: 'string',
      mask: true,
    },
    directoryId: {
      type: 'string',
      mask: false,
    },
    subscriptionId: {
      type: 'string',
      mask: false,
    },
    ingestActiveDirectory: {
      type: 'boolean',
      mask: false,
    },
  },
  validateInvocation,

  getStepStartStates,

  integrationSteps: [
    ...activeDirectorySteps,
    ...computeSteps,
    ...cosmosdbSteps,
    ...databaseSteps,
    ...keyvaultSteps,
    ...networkSteps,
    ...storageSteps,
    ...interserviceSteps,
    ...authorizationSteps,
  ],
};
