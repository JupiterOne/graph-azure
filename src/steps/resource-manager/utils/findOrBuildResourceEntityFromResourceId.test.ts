import findOrBuildResourceEntityFromResourceId from './findOrBuildResourceEntityFromResourceId';
import { Entity } from '@jupiterone/integration-sdk-core';
import instanceConfig from '../../../../test/integrationInstanceConfig';
import { entities as keyvaultEntities } from '../key-vault/constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';

describe('#findOrBuildResourceEntityFromResourceId', () => {
  test('should find resource entity that exists in the job state', async () => {
    const id =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id';
    const targetEntity: Entity = {
      _class: ['Service'],
      _type: keyvaultEntities.KEY_VAULT._type,
      _key: id,
    };

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [targetEntity],
    });

    const response = await findOrBuildResourceEntityFromResourceId(context, {
      resourceId: id,
    });

    expect(response).toBe(targetEntity);
  });

  test('should build placeholder entity for matched resourceId that does not exist in the job state', async () => {
    const id =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id';

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [],
    });

    const response = await findOrBuildResourceEntityFromResourceId(context, {
      resourceId: id,
    });

    expect(response).toEqual({
      _type: keyvaultEntities.KEY_VAULT._type,
      _key: id,
    });
  });

  test('should return undefined if resourceId does not match', async () => {
    const id = 'some-random-id';

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [],
    });

    const response = await findOrBuildResourceEntityFromResourceId(context, {
      resourceId: id,
    });

    expect(response).toBeUndefined();
  });
});
