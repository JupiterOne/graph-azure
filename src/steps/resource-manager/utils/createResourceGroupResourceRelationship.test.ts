import instanceConfig from '../../../../test/integrationInstanceConfig';
import { Entity, StepExecutionContext } from '@jupiterone/integration-sdk-core';
import createResourceGroupResourceRelationship from './createResourceGroupResourceRelationship';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';

describe('#createResourceGroupResourceRelationship', () => {
  test('should return direct relationship when resourceGroup exists in jobState', async () => {
    const resourceGroupId =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id';
    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: resourceGroupId,
    };

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceGroupEntity],
    });

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key:
        resourceGroupId + '/providers/Microsoft/KeyVault/vaults/key-vault-id',
    };

    await createResourceGroupResourceRelationship(context as StepExecutionContext, resourceEntity);

    expect(context.jobState.collectedRelationships.length).toBe(1);
    const result = context.jobState.collectedRelationships[0];

    expect(result).toEqual({
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id',
      _key: '/subscriptions/subscription-id/resourceGroups/resource-group-id|has|/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  test('should return direct relationship when resourcegroup (lowercase g) exists in jobState', async () => {
    const resourceGroupId =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id';
    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: resourceGroupId,
    };

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceGroupEntity],
    });

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key:
        resourceGroupId.replace('resourceGroups', 'resourcegroups') +
        '/providers/Microsoft/KeyVault/vaults/key-vault-id',
    };

    await createResourceGroupResourceRelationship(context as StepExecutionContext, resourceEntity);

    expect(context.jobState.collectedRelationships.length).toBe(1);
    const result = context.jobState.collectedRelationships[0];

    expect(result).toEqual({
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id',
      _key: '/subscriptions/subscription-id/resourceGroups/resource-group-id|has|/subscriptions/subscription-id/resourcegroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourcegroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  test('should throw when resourceGroup does not exist in jobState', async () => {
    const resourceGroupId =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id';

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [],
    });

    const loggerErrorSpy = jest.spyOn(context.logger, 'error');

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key:
        resourceGroupId + '/providers/Microsoft/KeyVault/vaults/key-vault-id',
    };

    await createResourceGroupResourceRelationship(context as StepExecutionContext, resourceEntity);

    expect(context.jobState.collectedRelationships.length).toBe(0);

    expect(loggerErrorSpy).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      new Error(
        'Could not find the resource group "/subscriptions/subscription-id/resourceGroups/resource-group-id" in this subscription.',
      ),
    );
  });

  test('should throw when resourceGroup cannot be extracted from entity _key', async () => {
    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [],
    });

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key: 'some-key-without-resource-group',
    };

    const exec = async () =>
      createResourceGroupResourceRelationship(context as StepExecutionContext, resourceEntity);

    await expect(exec).rejects.toThrow(
      'Could not identify a resource group ID in the entity _key: some-key-without-resource-group',
    );
  });

  test('should lowercase & return direct relationship when case-insensitive resourceGroup exists in jobState', async () => {
    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: '/subscriptions/subscription-id/resourceGroups/resource-group-id',
    };

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [resourceGroupEntity],
    }) ;

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key: '/subscriptions/subscription-id/resourceGroups/RESOURCE-GROUP-ID/providers/Microsoft/KeyVault/vaults/key-vault-id',
    };

    await createResourceGroupResourceRelationship(context as StepExecutionContext, resourceEntity);

    expect(context.jobState.collectedRelationships.length).toBe(1);
    const result = context.jobState.collectedRelationships[0];

    expect(result).toEqual({
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id',
      _key: '/subscriptions/subscription-id/resourceGroups/resource-group-id|has|/subscriptions/subscription-id/resourceGroups/RESOURCE-GROUP-ID/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourceGroups/RESOURCE-GROUP-ID/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });
});
