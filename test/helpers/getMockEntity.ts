import { createAccountEntity } from '../../src/steps/active-directory/converters';
import { v4 as uuid } from 'uuid';
import { IntegrationConfig } from '../../src/types';
import { createResourceGroupEntity } from '../../src/steps/resource-manager/resources/converters';
import { createAzureWebLinker } from '../../src/azure';

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

export function getMockResourceGroupEntity(resourceGroupName: string) {
  return createResourceGroupEntity(webLinker, {
    name: resourceGroupName,
    location: 'useast1',
    id: 'RESOURCE_GROUP_ID',
  });
}
