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
  steps as computeSteps,
} from './steps/resource-manager/compute';
import { STEP_RM_COSMOSDB_SQL_DATABASES } from './steps/resource-manager/cosmosdb';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES,
} from './steps/resource-manager/databases';
import { steps as postgreSqlDatabaseSteps } from './steps/resource-manager/databases/postgresql/constants';
import { steps as sqlDatabaseSteps } from './steps/resource-manager/databases/sql/constants';
import { STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS } from './steps/resource-manager/interservice';
import { STEP_RM_KEYVAULT_VAULTS } from './steps/resource-manager/key-vault';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_LOAD_BALANCERS,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
  STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
  STEP_RM_NETWORK_AZURE_FIREWALLS,
  STEP_RM_NETWORK_WATCHERS,
  STEP_RM_NETWORK_FLOW_LOGS,
  STEP_RM_NETWORK_LOCATION_WATCHERS,
} from './steps/resource-manager/network';
import { steps as storageSteps } from './steps/resource-manager/storage';
import { IntegrationConfig } from './types';
import {
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
  STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
  STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
} from './steps/resource-manager/authorization';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from './steps/resource-manager/resources';
import { steps as subscriptionSteps } from './steps/resource-manager/subscriptions/constants';
import {
  STEP_RM_API_MANAGEMENT_SERVICES,
  STEP_RM_API_MANAGEMENT_APIS,
} from './steps/resource-manager/api-management';
import {
  STEP_RM_DNS_ZONES,
  STEP_RM_DNS_RECORD_SETS,
} from './steps/resource-manager/dns';
import {
  STEP_RM_PRIVATE_DNS_ZONES,
  STEP_RM_PRIVATE_DNS_RECORD_SETS,
} from './steps/resource-manager/private-dns';
import {
  STEP_RM_CONTAINER_REGISTRIES,
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
} from './steps/resource-manager/container-registry';
import {
  STEP_RM_SERVICE_BUS_NAMESPACES,
  STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
  STEP_RM_SERVICE_BUS_QUEUES,
  STEP_RM_SERVICE_BUS_TOPICS,
} from './steps/resource-manager/service-bus';
import {
  STEP_RM_CDN_PROFILE,
  STEP_RM_CDN_ENDPOINTS,
} from './steps/resource-manager/cdn';
import {
  STEP_RM_BATCH_ACCOUNT,
  STEP_RM_BATCH_POOL,
  STEP_RM_BATCH_APPLICATION,
  STEP_RM_BATCH_CERTIFICATE,
} from './steps/resource-manager/batch';
import {
  STEP_RM_REDIS_CACHES,
  STEP_RM_REDIS_FIREWALL_RULES,
  STEP_RM_REDIS_LINKED_SERVERS,
} from './steps/resource-manager/redis-cache';
import { STEP_RM_CONTAINER_GROUPS } from './steps/resource-manager/container-instance';
import {
  STEP_RM_EVENT_GRID_DOMAINS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
  STEP_RM_EVENT_GRID_TOPICS,
  STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
} from './steps/resource-manager/event-grid';
import { AdvisorSteps } from './steps/resource-manager/advisor';
import { SecuritySteps } from './steps/resource-manager/security/constants';
import { PolicySteps } from './steps/resource-manager/policy/constants';
import { MonitorSteps } from './steps/resource-manager/monitor/constants';

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
      [STEP_RM_NETWORK_AZURE_FIREWALLS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVERS]: { disabled: true },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [sqlDatabaseSteps.DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: true },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: true },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: true },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: true },
      [storageSteps.STORAGE_QUEUES]: { disabled: true },
      [storageSteps.STORAGE_TABLES]: { disabled: true },
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
      [subscriptionSteps.SUBSCRIPTIONS]: { disabled: true },
      [subscriptionSteps.LOCATIONS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: true },
      [STEP_RM_DNS_ZONES]: { disabled: true },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_CDN_PROFILE]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: true },
      [STEP_RM_BATCH_POOL]: { disabled: true },
      [STEP_RM_BATCH_APPLICATION]: { disabled: true },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: true },
      [STEP_RM_REDIS_CACHES]: { disabled: true },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: true },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: true },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: true },
      [SecuritySteps.ASSESSMENTS]: { disabled: true },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: true },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: true },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
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
      [STEP_RM_NETWORK_AZURE_FIREWALLS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVERS]: { disabled: true },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [sqlDatabaseSteps.DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: true },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: true },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: true },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: true },
      [storageSteps.STORAGE_QUEUES]: { disabled: true },
      [storageSteps.STORAGE_TABLES]: { disabled: true },
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
      [subscriptionSteps.SUBSCRIPTIONS]: { disabled: true },
      [subscriptionSteps.LOCATIONS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: true },
      [STEP_RM_DNS_ZONES]: { disabled: true },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_CDN_PROFILE]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: true },
      [STEP_RM_BATCH_POOL]: { disabled: true },
      [STEP_RM_BATCH_APPLICATION]: { disabled: true },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: true },
      [STEP_RM_REDIS_CACHES]: { disabled: true },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: true },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: true },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: true },
      [SecuritySteps.ASSESSMENTS]: { disabled: true },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: true },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: true },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
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
      [STEP_RM_NETWORK_AZURE_FIREWALLS]: { disabled: false },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: false },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: false },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: false },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: false },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: false },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: false },
      [STEP_RM_COMPUTE_VIRTUAL_MACHINES]: { disabled: false },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: false },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: false },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: false },
      [sqlDatabaseSteps.SERVERS]: { disabled: false },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [sqlDatabaseSteps.DATABASES]: { disabled: false },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: false },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: false },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: false },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: false },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: false },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: false },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: false },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: false },
      [storageSteps.STORAGE_QUEUES]: { disabled: false },
      [storageSteps.STORAGE_TABLES]: { disabled: false },
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
      [subscriptionSteps.SUBSCRIPTIONS]: { disabled: false },
      [subscriptionSteps.LOCATIONS]: { disabled: false },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: false },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: false },
      [STEP_RM_DNS_ZONES]: { disabled: false },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: false },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: false },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: false },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: false },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: false },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: false },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: false },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: false },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: false },
      [STEP_RM_CDN_PROFILE]: { disabled: false },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: false },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: false },
      [STEP_RM_BATCH_POOL]: { disabled: false },
      [STEP_RM_BATCH_APPLICATION]: { disabled: false },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: false },
      [STEP_RM_REDIS_CACHES]: { disabled: false },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: false },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: false },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: false },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: false },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: false },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: false },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: false },
      [SecuritySteps.ASSESSMENTS]: { disabled: false },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: false },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: false },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: false },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: false },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: false,
      },
    });
  });
});
