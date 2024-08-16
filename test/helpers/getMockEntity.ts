import { createAccountEntity } from '../../src/steps/active-directory/converters';
import { v4 as uuid } from 'uuid';
import { IntegrationConfig } from '../../src/types';
import { createResourceGroupEntity } from '../../src/steps/resource-manager/resources/converters';
import { createAzureWebLinker } from '../../src/azure';
import { createSubscriptionEntity } from '../../src/steps/resource-manager/subscriptions/converters';

const webLinker = createAzureWebLinker(undefined);

export function getMockAccountEntity(config: IntegrationConfig) {
  return createAccountEntity({
    name: 'mock-account',
    id: uuid(),
    integrationDefinitionId: uuid(),
    accountId: uuid(),
    config,
  });
}

export function getMockResourceGroupEntity(
  name: string,
  id = 'RESOURCE_GROUP_ID',
) {
  return createResourceGroupEntity(webLinker, {
    name: name,
    location: 'useast1',
    id: id,
  });
}

export function getMockSubscriptionEntity(config: IntegrationConfig) {
  return createSubscriptionEntity(webLinker, {
    id: `/subscriptions/${config.subscriptionId}`, 
  }, 'TestTenantId');
}
