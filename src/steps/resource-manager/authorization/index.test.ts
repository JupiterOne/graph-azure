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
  fetchUsers,
  fetchGroups,
  fetchServicePrincipals,
} from '../../active-directory';
import {
  USER_ENTITY_TYPE,
  ACCOUNT_ENTITY_TYPE,
  GROUP_ENTITY_TYPE,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
} from '../../active-directory/constants';
import { KEY_VAULT_SERVICE_ENTITY_TYPE } from '../key-vault/constants';
import { entities as SubscriptionEntities } from '../subscriptions/constants';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import {
  getMockAccountEntity,
  getMockSubscriptionEntity,
} from '../../../../test/helpers/getMockEntity';
import {
  ExplicitRelationship,
  generateRelationshipType,
  MappedRelationship,
  Relationship,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';
import { fetchKeyVaults } from '../key-vault';
import { fetchManagementGroups } from '../management-groups';
import { ManagementGroupEntities } from '../management-groups/constants';
import { fetchSubscription } from '../subscriptions/executionHandlers/subscriptions';

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
    _class: ['AccessPolicy'],
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
      context.jobState.collectedRelationships,
    );

    expect(directRelationships).toHaveLength(0);

    expect(mappedUserRelationships.length).toBeGreaterThan(0);
    expect(mappedUserRelationships).toTargetEntities(userEntities);

    expect(mappedGroupRelationships.length).toBeGreaterThan(0);
    expect(mappedGroupRelationships).toTargetEntities(groupEntities);

    expect(mappedServicePrincipalRelationships.length).toBeGreaterThan(0);
    expect(mappedServicePrincipalRelationships).toTargetEntities(
      servicePrincipalEntities,
    );

    expect(restRelationships).toHaveLength(0);
  }, 10_000);
});

describe('rm-authorization-role-assignment-scope-relationships', () => {
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

    await fetchSubscription(context);
    const subscriptionEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === SubscriptionEntities.SUBSCRIPTION._type,
    );
    expect(subscriptionEntities).toHaveLength(1);

    await fetchKeyVaults(context);
    const keyVaultEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === KEY_VAULT_SERVICE_ENTITY_TYPE,
    );
    expect(keyVaultEntities.length).toBeGreaterThan(0);

    await fetchManagementGroups(context);
    const managementGroupEntities = context.jobState.collectedEntities.filter(
      (e) => e._type === ManagementGroupEntities.MANAGEMENT_GROUP._type,
    );
    expect(managementGroupEntities.length).toBeGreaterThan(0);

    // TODO azure allows role assignments at the special "/" scope, which is assigned over the entire tenant.
    // We need to start ingesting the azure tenant (or possibly just use the "account" entity) and test that
    // the scope of "/" appropriately creates a realtionship to the tenant entity.
    // await fetchAzureTenant(context);
    // const azureTenantEntities = context.jobState.collectedEntities.filter(
    //   (e) => e._type === '',
    // );
    // expect(azureTenantEntities.length).toBeGreaterThan(0);

    return {
      roleAssignmentEntities,
      subscriptionEntities,
      keyVaultEntities,
      managementGroupEntities,
      // azureTenantEntities,
    };
  }

  function separateRoleAssignmentScopeRelationships(
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
      targets: directSubscriptionRelationships,
      rest: restDirectRelationships,
    } = filterGraphObjects(
      directRelationships,
      (r) =>
        r._type ===
        generateRelationshipType(
          RelationshipClass.ALLOWS,
          entities.ROLE_ASSIGNMENT._type,
          SubscriptionEntities.SUBSCRIPTION._type,
        ),
    );
    const {
      targets: mappedKeyVaultRelationships,
      rest: restAfterKeyVault,
    } = filterGraphObjects(mappedRelationships, (r) =>
      (r._mapping.targetEntity.id as string).includes(
        'Microsoft.KeyVault/vaults',
      ),
    );
    const {
      targets: mappedManagementGroupRelationships,
      rest: restAfterManagementGroups,
    } = filterGraphObjects(restAfterKeyVault, (r) =>
      (r._mapping.targetEntity.id as string).includes(
        'Microsoft.Management/managementGroups',
      ),
    );
    // TODO add mapped tenant relationships for scope of "/"
    // const {
    //   targets: mappedTenantRelationships,
    //   rest: restAfterTenant,
    // } = filterGraphObjects(
    //   restAfterManagementGroups,
    //   (r) => (r._mapping.targetEntity.id as string).includes('TODO DEFINE'),
    // );

    return {
      directSubscriptionRelationships,
      restDirectRelationships,

      mappedKeyVaultRelationships,
      mappedManagementGroupRelationships,
      restMappedRelationships: restAfterManagementGroups,
      // mappedTenantRelationships,
      // restMappedRelationships: restAfterTenant,
    };
  }

  /**
   * Role assignment -> scope relationships can be either direct or mapped.
   *
   * This test ensures the following three cases are met:
   *   1. Direct relationships are created when the entity exists
   *      in the target scope. We use `azure_subscription` entities
   *      to test this case.
   *   2. Valid mapped relationships are created when the entity is
   *      _within_ the subscription scope, but is not currently
   *      ingested. We use `azure_keyvault_service` entities to test
   *      this case.
   *   3. Valid mapped relationships are created when the entity is
   *      _outside_ the subscription scope. We use `azure_management_group`
   *      entities to test this case.
   *   4. [TODO / NOT IMPLEMENTED] In the future, we also need to handle the
   *      special case where scope = "/", which indicates permissions
   *      at the Tenant level.
   */
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-authorization-role-assignment-scope-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      roleAssignmentEntities,
      subscriptionEntities,
      ...entityTypesNotInJobState
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [...roleAssignmentEntities, ...subscriptionEntities],
    });

    await buildRoleAssignmentScopeRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const {
      directSubscriptionRelationships,
      // restDirectRelationships, // additional direct relationships are OK in this test.
      mappedKeyVaultRelationships,
      mappedManagementGroupRelationships,
      // restMappedRelationships, // additional mapped relationships are OK in this test.
    } = separateRoleAssignmentScopeRelationships(
      context.jobState.collectedRelationships,
    );

    expect(directSubscriptionRelationships.length).toBeGreaterThan(0);
    expect(directSubscriptionRelationships).toMatchDirectRelationshipSchema({});

    expect(mappedKeyVaultRelationships.length).toBeGreaterThan(0);
    expect(mappedKeyVaultRelationships).toTargetEntities(
      entityTypesNotInJobState.keyVaultEntities,
    );

    expect(mappedManagementGroupRelationships.length).toBeGreaterThan(0);
    expect(mappedManagementGroupRelationships).toTargetEntities(
      entityTypesNotInJobState.managementGroupEntities,
    );
  }, 20000);
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
    _class: ['UserGroup'],
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
