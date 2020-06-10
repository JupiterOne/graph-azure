/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createMockExecutionContext } from '@jupiterone/integration-sdk/testing';

import getStepStartStates from './getStepStartStates';
import { invocationConfig } from './index';
import {
  STEP_AD_ACCOUNT,
  STEP_AD_GROUP_MEMBERS,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
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
} from './steps/resource-manager/network';
import { STEP_RM_STORAGE_RESOURCES } from './steps/resource-manager/storage';
import { IntegrationConfig } from './types';

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
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
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
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
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
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
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
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
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
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: false },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: false },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: false },
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
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: false },
    });
  });
});