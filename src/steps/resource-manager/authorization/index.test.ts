import {
  fetchClassicAdministrators,
  fetchRoleAssignments,
  buildRoleAssignmentPrincipalRelationships,
  fetchRoleDefinitions,
  buildRoleAssignmentScopeRelationships,
} from '.';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { entities, relationships } from './constants';
import {
  Recording,
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import {
  USER_ENTITY_TYPE,
  ACCOUNT_ENTITY_TYPE,
  GROUP_ENTITY_TYPE,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  fetchUsers,
  fetchGroups,
  fetchServicePrincipals,
} from '../../active-directory';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import {
  getMockAccountEntity,
  getMockSubscriptionEntity,
} from '../../../../test/helpers/getMockEntity';
import {
  Entity,
  ExplicitRelationship,
  MappedRelationship,
  Relationship,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test('step - role assignments', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-step-role-assignments',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchRoleAssignments(context);

  expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'AccessPolicy',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_role_assignment' },
        _key: { type: 'string' },
        _class: { type: 'array', items: { const: 'AccessRole' } },
        id: { type: 'string' },
        name: { type: 'string' },
        displayName: { type: 'string' },
        type: { const: 'Microsoft.Authorization/roleAssignments' },
        scope: { type: 'string' },
        roleDefinitionId: { type: 'string' },
        principalId: { type: 'string' },
        principalType: { type: 'string' },
        webLink: { type: 'string' },
        canDelegate: { type: 'boolean' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });
  expect(context.jobState.collectedRelationships.length).toBe(0);
});

describe('rm-authorization-role-assignment-principal-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      entities: [accountEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchRoleAssignments(context);
    const roleAssignmentEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === entities.ROLE_ASSIGNMENT._type,
    );
    expect(roleAssignmentEntities.length).toBeGreaterThan(0);

    await fetchUsers(context);
    const userEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === USER_ENTITY_TYPE,
    );
    expect(userEntities.length).toBeGreaterThan(0);

    await fetchGroups(context);
    const groupEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === GROUP_ENTITY_TYPE,
    );
    expect(groupEntities.length).toBeGreaterThan(0);

    await fetchServicePrincipals(context);
    const servicePrincipalEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === SERVICE_PRINCIPAL_ENTITY_TYPE,
    );
    expect(servicePrincipalEntities.length).toBeGreaterThan(0);

    return {
      roleAssignmentEntities,
      userEntities,
      groupEntities,
      servicePrincipalEntities,
    };
  }

  function separateRoleAssignmentPrincipalRelatinships(
    collectedRelationships: Relationship[],
  ) {
    const {
      targets: directRelationships,
      rest: mappedRelationships,
    } = filterGraphObjects(collectedRelationships, (r) => !r._mapping) as {
      targets: ExplicitRelationship[];
      rest: MappedRelationship[];
    };
    const {
      targets: mappedUserRelationships,
      rest: restAfterUser,
    } = filterGraphObjects(
      mappedRelationships,
      (r) => r._mapping.targetEntity._type === USER_ENTITY_TYPE,
    );
    const {
      targets: mappedGroupRelationships,
      rest: restAfterGroup,
    } = filterGraphObjects(
      restAfterUser,
      (r) => r._mapping.targetEntity._type === GROUP_ENTITY_TYPE,
    );
    const {
      targets: mappedServicePrincipalRelationships,
      rest: restAfterServicePrincipal,
    } = filterGraphObjects(
      restAfterGroup,
      (r) => r._mapping.targetEntity._type === SERVICE_PRINCIPAL_ENTITY_TYPE,
    );

    return {
      directRelationships,
      mappedUserRelationships,
      mappedGroupRelationships,
      mappedServicePrincipalRelationships,
      rest: restAfterServicePrincipal,
    };
  }

  /**
   * We need to keep resource manager steps decoupled from active directory steps.
   *
   * This test ensures that mapped relationships are created that will properly map
   * to users, groups, and service principals generated in active directory steps.
   */
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-authorization-role-assignment-principal-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      userEntities,
      groupEntities,
      servicePrincipalEntities,
      roleAssignmentEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: roleAssignmentEntities,
    });

    await buildRoleAssignmentPrincipalRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const {
      directRelationships,
      mappedUserRelationships,
      mappedGroupRelationships,
      mappedServicePrincipalRelationships,
      rest: restRelationships,
    } = separateRoleAssignmentPrincipalRelatinships(
      context.jobState.collectedRelationships as MappedRelationship[],
    );

    expect(directRelationships).toHaveLength(0);

    expect(mappedUserRelationships.length).toBeGreaterThan(0);
    expect(mappedUserRelationships).toCreateValidRelationshipsToEntities(
      userEntities,
    );

    expect(mappedGroupRelationships.length).toBeGreaterThan(0);
    expect(mappedGroupRelationships).toCreateValidRelationshipsToEntities(
      groupEntities,
    );

    expect(mappedServicePrincipalRelationships.length).toBeGreaterThan(0);
    expect(
      mappedServicePrincipalRelationships,
    ).toCreateValidRelationshipsToEntities(servicePrincipalEntities);

    expect(restRelationships).toHaveLength(0);
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toCreateValidRelationshipsToEntities(entities: Entity[]): R;
    }
  }
}

expect.extend({
  toCreateValidRelationshipsToEntities(
    mappedRelationships: MappedRelationship[],
    entities: Entity[],
  ) {
    for (const mappedRelationship of mappedRelationships) {
      const _mapping = mappedRelationship._mapping;
      if (!_mapping) {
        throw new Error(
          'expect(mappedRelationships).toCreateValidRelationshipsToEntities() requires relationships with the `_mapping` property!',
        );
      }
      const targetEntity = _mapping.targetEntity;
      for (let targetFilterKey of _mapping.targetFilterKeys) {
        /* type TargetFilterKey = string | string[]; */
        if (!Array.isArray(targetFilterKey)) {
          console.warn(
            'WARNING: Found mapped relationship with targetFilterKey of type string. Please ensure the targetFilterKey was not intended to be of type string[]',
          );
          targetFilterKey = [targetFilterKey];
        }
        const mappingTargetEntities = entities.filter((entity) =>
          (targetFilterKey as string[]).every(
            (k) => targetEntity[k] === entity[k],
          ),
        );

        if (mappingTargetEntities.length === 0) {
          return {
            message: () =>
              `No target entity found for mapped relationship: ${JSON.stringify(
                mappedRelationship,
                null,
                2,
              )}`,
            pass: false,
          };
        } else if (mappingTargetEntities.length > 1) {
          return {
            message: () =>
              `Multiple target entities found for mapped relationship [${mappingTargetEntities.map(
                (e) => e._key,
              )}]; expected exactly one: ${JSON.stringify(
                mappedRelationship,
                null,
                2,
              )}`,
            pass: false,
          };
        }
      }
    }
    return {
      message: () => '',
      pass: true,
    };
  },
});

test('step - role assignment scope relationships', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  const keyVaultPrefix =
    '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/';
  const keyVaultId = keyVaultPrefix + 'key-vault-id';

  const keyVaultEntity = {
    _key: keyVaultId,
    _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
    _class: ['Service'],
  };

  const roleAssignmentDirectEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    scope: keyVaultId,
  };

  const roleAssignmentMappedEntity = {
    _key:
      '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id-2',
    _type: entities.ROLE_ASSIGNMENT._type,
    _class: entities.ROLE_ASSIGNMENT._class,
    scope: keyVaultPrefix + 'some-non-keyvault',
  };

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    entities: [
      keyVaultEntity,
      roleAssignmentDirectEntity,
      roleAssignmentMappedEntity,
    ],
  });

  await buildRoleAssignmentScopeRelationships(context);

  expect(context.jobState.collectedEntities.length).toBe(0);
  expect(context.jobState.collectedRelationships).toEqual([
    {
      _key:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id|allows|/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id',
      _type: 'azure_role_assignment_allows_keyvault_service',
      _class: 'ALLOWS',
      _fromEntityKey:
        '/subscriptions/subscription-id/providers/Microsoft.Authorization/roleAssignments/role-assignment-id',
      _toEntityKey:
        '/subscriptions/subscription-id/resourceGroups/resource-group-id/providers/Microsoft.KeyVault/vaults/key-vault-id',
      displayName: 'ALLOWS',
    },
  ]);
});

describe('rm-authorization-role-definitions', () => {
  function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);
    const subscriptionEntity = getMockSubscriptionEntity(config);
    return { accountEntity, subscriptionEntity };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-authorization-role-definitions',
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: configFromEnv,
          shouldReplaceSubscriptionId: () => true,
        }),
      },
    });

    const { accountEntity, subscriptionEntity } = getSetupEntities(
      configFromEnv,
    );
    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [subscriptionEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchRoleDefinitions(context);

    const roleDefinitionEntities = context.jobState.collectedEntities;

    expect(roleDefinitionEntities.length).toBeGreaterThan(0);
    expect(roleDefinitionEntities).toMatchGraphObjectSchema({
      _class: entities.ROLE_DEFINITION._class,
    });

    const subscriptionRoleDefinitionRelationships =
      context.jobState.collectedRelationships;

    expect(subscriptionRoleDefinitionRelationships.length).toBe(
      roleDefinitionEntities.length,
    );
    expect(
      subscriptionRoleDefinitionRelationships,
    ).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: {
            const: relationships.SUBSCRIPTION_CONTAINS_ROLE_DEFINITION._type,
          },
        },
      },
    });
  });
});

test('step - classic administrators', async () => {
  const instanceConfig: IntegrationConfig = {
    clientId: process.env.CLIENT_ID || 'clientId',
    clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
    directoryId: '992d7bbe-b367-459c-a10f-cf3fd16103ab',
    subscriptionId: 'd3803fd6-2ba4-4286-80aa-f3d613ad59a7',
  };

  recording = setupAzureRecording({
    directory: __dirname,
    name: 'active-directory-step-classic-administrators',
  });

  const context = createMockAzureStepExecutionContext({
    instanceConfig,
    setData: {
      [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
    },
  });

  await fetchClassicAdministrators(context);

  expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
    _class: 'UserGroup',
    schema: {
      additionalProperties: false,
      properties: {
        _type: { const: 'azure_classic_admin_group' },
        _key: { const: 'azure_classic_admin_group' },
        _class: { type: 'array', items: { const: 'UserGroup' } },
        name: { const: 'Azure Classic Administrator' },
        displayName: { const: 'Azure Classic Administrator' },
        _rawData: { type: 'array', items: { type: 'object' } },
      },
    },
  });

  expect(context.jobState.collectedRelationships).toEqual([
    {
      _class: 'HAS',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: 'azure_classic_admin_group',
        targetFilterKeys: [['_type', 'userPrincipalName']],
        targetEntity: {
          _type: 'azure_user',
          userPrincipalName: '',
        },
      },
      displayName: 'HAS',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/',
      name: '',
      type: 'Microsoft.Authorization/classicAdministrators',
      emailAddress: '',
      role: 'ServiceAdministrator;AccountAdministrator',
      webLink:
        'https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/',
      _key:
        'azure_classic_admin_group|has|FORWARD:_type=azure_user:userPrincipalName=',
      _type: 'azure_classic_admin_group_has_user',
    },
    {
      _class: 'HAS',
      _mapping: {
        relationshipDirection: 'FORWARD',
        sourceEntityKey: 'azure_classic_admin_group',
        targetFilterKeys: [['_type', 'userPrincipalName']],
        targetEntity: {
          _type: 'azure_user',
          userPrincipalName:
            'ndowmon_gmail.com#EXT#@ndowmongmail.onmicrosoft.com',
        },
      },
      displayName: 'HAS',
      id:
        '/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/00030000D25AEAF7',
      name: '00030000D25AEAF7',
      type: 'Microsoft.Authorization/classicAdministrators',
      emailAddress: 'ndowmon_gmail.com#EXT#@ndowmongmail.onmicrosoft.com',
      role: 'CoAdministrator',
      webLink:
        'https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/d3803fd6-2ba4-4286-80aa-f3d613ad59a7/providers/Microsoft.Authorization/classicAdministrators/00030000D25AEAF7',
      _key:
        'azure_classic_admin_group|has|FORWARD:_type=azure_user:userPrincipalName=ndowmon_gmail.com#EXT#@ndowmongmail.onmicrosoft.com',
      _type: 'azure_classic_admin_group_has_user',
    },
  ]);
});
