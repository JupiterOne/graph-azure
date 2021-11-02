import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';

import { GraphClient } from './azure/graph/client';

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
import { resourcesSteps } from './steps/resource-manager/resources';
import { subscriptionSteps } from './steps/resource-manager/subscriptions';
import { apiManagementSteps } from './steps/resource-manager/api-management';
import { dnsSteps } from './steps/resource-manager/dns';
import { privateDnsSteps } from './steps/resource-manager/private-dns';
import { containerRegistrySteps } from './steps/resource-manager/container-registry';
import { serviceBusSteps } from './steps/resource-manager/service-bus';
import { cdnSteps } from './steps/resource-manager/cdn';
import { batchSteps } from './steps/resource-manager/batch';
import { redisCacheSteps } from './steps/resource-manager/redis-cache';
import { containerInstanceSteps } from './steps/resource-manager/container-instance';
import { eventGridSteps } from './steps/resource-manager/event-grid';
import { advisorSteps } from './steps/resource-manager/advisor';
import { securitySteps } from './steps/resource-manager/security';
import { policySteps } from './steps/resource-manager/policy';
import { monitorSteps } from './steps/resource-manager/monitor';
import { appServiceSteps } from './steps/resource-manager/appservice';
import { policyInsightSteps } from './steps/resource-manager/policy-insights';
import { managementGroupSteps } from './steps/resource-manager/management-groups';
import { containerServicesSteps } from './steps/resource-manager/container-services';

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
    configureSubscriptionInstances: {
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
    ...resourcesSteps,
    ...subscriptionSteps,
    ...apiManagementSteps,
    ...dnsSteps,
    ...privateDnsSteps,
    ...containerRegistrySteps,
    ...serviceBusSteps,
    ...cdnSteps,
    ...batchSteps,
    ...redisCacheSteps,
    ...containerInstanceSteps,
    // NOTE: Because any resource in Azure could be an Event Grid Topic, this step should be executed last. See SDK #326: https://github.com/JupiterOne/sdk/issues/326
    // This will ensure that other resources that an organization has can be tracked as 'topics' so that we can associate Event Grid Topic Subscriptions to them.
    ...eventGridSteps,
    ...advisorSteps,
    ...securitySteps,
    ...policySteps,
    ...monitorSteps,
    ...appServiceSteps,
    ...policyInsightSteps,
    ...managementGroupSteps,
    ...containerServicesSteps,
  ],

  normalizeGraphObjectKey: (_key) => _key.toLowerCase(),
};

export const clients = {
  GraphClient,
};
