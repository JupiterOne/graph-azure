import findOrBuildResourceEntityFromResourceId from './findOrBuildResourceEntityFromResourceId';
import { Entity } from '@jupiterone/integration-sdk-core';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import instanceConfig from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault';

describe('#findOrBuildResourceEntityFromResourceId', () => {
  test('should find resource entity that exists in the job state', async () => {
    const id =
      '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id';
    const targetEntity: Entity = {
      _class: ['Service'],
      _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
      _key: id,
    };

    const context = createMockStepExecutionContext<IntegrationConfig>({
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

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });

    const response = await findOrBuildResourceEntityFromResourceId(context, {
      resourceId: id,
    });

    expect(response).toEqual({
      _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
      _key: id,
    });
  });

  test('should return undefined if resourceId does not match', async () => {
    const id = 'some-random-id';

    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: [],
    });

    const response = await findOrBuildResourceEntityFromResourceId(context, {
      resourceId: id,
    });

    expect(response).toBeUndefined();
  });
});
