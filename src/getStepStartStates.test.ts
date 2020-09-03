/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import getStepStartStates from './getStepStartStates';
import { invocationConfig } from './index';
import {
  STEP_AD_ACCOUNT,
  STEP_AD_GROUP_MEMBERS,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  STEP_AD_SERVICE_PRINCIPALS,
} from './steps/active-directory';
import {
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
} from './steps/resource-manager/compute';
import { STEP_RM_COSMOSDB_SQL_DATABASES } from './steps/resource-manager/cosmosdb';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES,
  STEP_RM_DATABASE_POSTGRESQL_DATABASES,
  STEP_RM_DATABASE_SQL_DATABASES,
} from './steps/resource-manager/databases';
import { STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS } from './steps/resource-manager/interservice';
import { STEP_RM_KEYVAULT_VAULTS } from './steps/resource-manager/key-vault';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_LOAD_BALANCERS,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
  STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
} from './steps/resource-manager/network';
import {
  STEP_RM_STORAGE_RESOURCES,
  STEP_RM_STORAGE_QUEUES,
  STEP_RM_STORAGE_TABLES,
} from './steps/resource-manager/storage';
import { IntegrationConfig } from './types';
import {
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
  STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
  STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
} from './steps/resource-manager/authorization';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from './steps/resource-manager/resources';
import { STEP_RM_SUBSCRIPTIONS } from './steps/resource-manager/subscriptions';

describe('getStepStartStates', () => {
  test('all steps represented', () => {
    const context = createMockExecutionContext<IntegrationConfig>();
    const states = getStepStartStates(context);
    const stepIds = invocationConfig.integrationSteps.map((s) => s.id);
    expect(Object.keys(states).sort()).toEqual(stepIds.sort());
  });

  test('empty config', () => {
    const context = createMockExecutionContext<IntegrationConfig>();
    const states = getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: true },
      [STEP_AD_GROUP_MEMBERS]: { disabled: true },
      [STEP_AD_USERS]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: true },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: true },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_POSTGRESQL_DATABASES]: { disabled: true },
      [STEP_RM_STORAGE_RESOURCES]: { disabled: true },
      [STEP_RM_STORAGE_QUEUES]: { disabled: true },
      [STEP_RM_STORAGE_TABLES]: { disabled: true },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS]: { disabled: true },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS]: { disabled: true },
      [STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: true },
      [STEP_RM_SUBSCRIPTIONS]: { disabled: true },
    });
  });

  test('ingestActiveDirectory: true', () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: { ingestActiveDirectory: true } as IntegrationConfig,
    });
    const states = getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: false },
      [STEP_AD_GROUP_MEMBERS]: { disabled: false },
      [STEP_AD_USERS]: { disabled: false },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: false },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: true },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_POSTGRESQL_DATABASES]: { disabled: true },
      [STEP_RM_STORAGE_RESOURCES]: { disabled: true },
      [STEP_RM_STORAGE_QUEUES]: { disabled: true },
      [STEP_RM_STORAGE_TABLES]: { disabled: true },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS]: { disabled: true },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS]: { disabled: true },
      [STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: true },
      [STEP_RM_SUBSCRIPTIONS]: { disabled: true },
    });
  });

  test("subscriptionId: 'value'", () => {
    const context = createMockExecutionContext({
      instanceConfig: { subscriptionId: '1234' } as IntegrationConfig,
    });
    const states = getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: true },
      [STEP_AD_GROUP_MEMBERS]: { disabled: true },
      [STEP_AD_USERS]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: true },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: false },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: false },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: false },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: false },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: false },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: false },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: false },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: false },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: false },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: false },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_SQL_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_POSTGRESQL_DATABASES]: { disabled: false },
      [STEP_RM_STORAGE_RESOURCES]: { disabled: false },
      [STEP_RM_STORAGE_QUEUES]: { disabled: false },
      [STEP_RM_STORAGE_TABLES]: { disabled: false },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: false },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS]: { disabled: false },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS]: { disabled: false },
      [STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS]: { disabled: false },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: false },
      [STEP_RM_SUBSCRIPTIONS]: { disabled: false },
    });
  });
});
