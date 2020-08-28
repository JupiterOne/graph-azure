import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import instanceConfig from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { Entity } from '@jupiterone/integration-sdk-core';
import createResourceGroupResourceRelationship from './createResourceGroupResourceRelationship';

describe('#createResourceGroupResourceRelationship', () => {
  test('should return direct relationship when resourceGroup exists in jobState', async () => {
    const resourceGroupId =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id';
    const resourceGroupEntity: Entity = {
      _class: ['Group'],
      _type: 'azure_resource_group',
      _key: resourceGroupId,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [resourceGroupEntity],
    });

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key:
        resourceGroupId + '/providers/Microsoft/KeyVault/vaults/key-vault-id',
    };

    const result = await createResourceGroupResourceRelationship(
      context,
      resourceEntity,
    );

    expect(result).toEqual({
      _class: 'HAS',
      _fromEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id',
      _key:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id|has|/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  test('should return mapped relationship when resourceGroup does not exist in jobState', async () => {
    const resourceGroupId =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id';

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key:
        resourceGroupId + '/providers/Microsoft/KeyVault/vaults/key-vault-id',
    };

    const result = await createResourceGroupResourceRelationship(
      context,
      resourceEntity,
    );

    expect(result).toEqual({
      _class: 'HAS',
      _key:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id|has|/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
      _mapping: {
        relationshipDirection: 'REVERSE',
        sourceEntityKey:
          '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft/KeyVault/vaults/key-vault-id',
        targetEntity: {
          _key:
            '/subscriptions/subscription-id/resourceGroups/resource-group-id',
          _type: 'azure_resource_group',
        },
        targetFilterKeys: [['_type', '_key']],
      },
      _type: 'azure_resource_group_has_keyvault_service',
      displayName: 'HAS',
    });
  });

  test('should throw when resourceGroup cannot be extracted from entity _key', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });

    const resourceEntity: Entity = {
      _class: ['Service'],
      _type: 'azure_keyvault_service',
      _key: 'some-key-without-resource-group',
    };

    const exec = async () =>
      createResourceGroupResourceRelationship(context, resourceEntity);

    await expect(exec).rejects.toThrow(
      'Could not identify a resource group ID in the entity _key: some-key-without-resource-group',
    );
  });
});
