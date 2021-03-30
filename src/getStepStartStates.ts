import {
  IntegrationExecutionContext,
  StepStartStates,
  StepStartState,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './types';
import { hasSubscriptionId } from './utils/hasSubscriptionId';

import {
  STEP_AD_ACCOUNT,
  STEP_AD_GROUP_MEMBERS,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  STEP_AD_SERVICE_PRINCIPALS,
} from './steps/active-directory/constants';
import {
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
  STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
  STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
  STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
} from './steps/resource-manager/authorization/constants';
import {
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
  STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
  STEP_RM_COMPUTE_VIRTUAL_MACHINES,
  steps as computeSteps,
} from './steps/resource-manager/compute/constants';
import { STEP_RM_COSMOSDB_SQL_DATABASES } from './steps/resource-manager/cosmosdb/constants';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES,
} from './steps/resource-manager/databases/constants';
import { steps as postgreSqlDatabaseSteps } from './steps/resource-manager/databases/postgresql/constants';
import { steps as sqlDatabaseSteps } from './steps/resource-manager/databases/sql/constants';
import { STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS } from './steps/resource-manager/interservice/constants';
import { STEP_RM_KEYVAULT_VAULTS } from './steps/resource-manager/key-vault/constants';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_LOAD_BALANCERS,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
  STEP_RM_NETWORK_AZURE_FIREWALLS,
  STEP_RM_NETWORK_WATCHERS,
  STEP_RM_NETWORK_FLOW_LOGS,
  STEP_RM_NETWORK_LOCATION_WATCHERS,
} from './steps/resource-manager/network/constants';
import { steps as storageSteps } from './steps/resource-manager/storage/constants';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from './steps/resource-manager/resources/constants';
import { steps as subscriptionSteps } from './steps/resource-manager/subscriptions/constants';
import {
  STEP_RM_API_MANAGEMENT_APIS,
  STEP_RM_API_MANAGEMENT_SERVICES,
} from './steps/resource-manager/api-management/constants';
import {
  STEP_RM_DNS_ZONES,
  STEP_RM_DNS_RECORD_SETS,
} from './steps/resource-manager/dns/constants';
import {
  STEP_RM_PRIVATE_DNS_ZONES,
  STEP_RM_PRIVATE_DNS_RECORD_SETS,
} from './steps/resource-manager/private-dns/constants';
import {
  STEP_RM_CONTAINER_REGISTRIES,
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
} from './steps/resource-manager/container-registry/constants';
import {
  STEP_RM_SERVICE_BUS_NAMESPACES,
  STEP_RM_SERVICE_BUS_QUEUES,
  STEP_RM_SERVICE_BUS_TOPICS,
  STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
} from './steps/resource-manager/service-bus/constants';
import {
  STEP_RM_CDN_PROFILE,
  STEP_RM_CDN_ENDPOINTS,
} from './steps/resource-manager/cdn/constants';
import {
  STEP_RM_BATCH_ACCOUNT,
  STEP_RM_BATCH_POOL,
  STEP_RM_BATCH_APPLICATION,
  STEP_RM_BATCH_CERTIFICATE,
} from './steps/resource-manager/batch/constants';
import {
  STEP_RM_REDIS_CACHES,
  STEP_RM_REDIS_FIREWALL_RULES,
  STEP_RM_REDIS_LINKED_SERVERS,
} from './steps/resource-manager/redis-cache/constants';
import { STEP_RM_CONTAINER_GROUPS } from './steps/resource-manager/container-instance/constants';
import {
  STEP_RM_EVENT_GRID_DOMAINS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
  STEP_RM_EVENT_GRID_TOPICS,
  STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
} from './steps/resource-manager/event-grid/constants';
import { AdvisorSteps } from './steps/resource-manager/advisor/constants';
import { SecuritySteps } from './steps/resource-manager/security/constants';
import { PolicySteps } from './steps/resource-manager/policy/constants';
import { MonitorSteps } from './steps/resource-manager/monitor/constants';

function makeStepStartStates(
  stepIds: string[],
  stepStartState: StepStartState,
): StepStartStates {
  const stepStartStates: StepStartStates = {};
  for (const stepId of stepIds) {
    stepStartStates[stepId] = stepStartState;
  }
  return stepStartStates;
}

interface GetApiSteps {
  executeFirstSteps: string[];
  executeLastSteps: string[];
}

export function getActiveDirectorySteps(): GetApiSteps {
  return {
    executeFirstSteps: [
      STEP_AD_GROUPS,
      STEP_AD_GROUP_MEMBERS,
      STEP_AD_USERS,
      STEP_AD_SERVICE_PRINCIPALS,
    ],
    executeLastSteps: [],
  };
}

export function getResourceManagerSteps(): GetApiSteps {
  return {
    executeFirstSteps: [
      STEP_RM_KEYVAULT_VAULTS,
      STEP_RM_NETWORK_VIRTUAL_NETWORKS,
      STEP_RM_NETWORK_SECURITY_GROUPS,
      STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
      STEP_RM_NETWORK_LOAD_BALANCERS,
      STEP_RM_NETWORK_AZURE_FIREWALLS,
      STEP_RM_NETWORK_WATCHERS,
      STEP_RM_NETWORK_LOCATION_WATCHERS,
      STEP_RM_NETWORK_FLOW_LOGS,
      STEP_RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
      STEP_RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
      STEP_RM_COMPUTE_VIRTUAL_MACHINES,
      computeSteps.VIRTUAL_MACHINE_EXTENSIONS,
      computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS,
      STEP_RM_COSMOSDB_SQL_DATABASES,
      STEP_RM_DATABASE_MARIADB_DATABASES,
      STEP_RM_DATABASE_MYSQL_DATABASES,
      postgreSqlDatabaseSteps.SERVERS,
      postgreSqlDatabaseSteps.DATABASES,
      postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES,
      sqlDatabaseSteps.SERVERS,
      sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS,
      sqlDatabaseSteps.DATABASES,
      sqlDatabaseSteps.SERVER_FIREWALL_RULES,
      sqlDatabaseSteps.SERVER_AD_ADMINS,
      storageSteps.STORAGE_ACCOUNTS,
      storageSteps.STORAGE_CONTAINERS,
      storageSteps.STORAGE_FILE_SHARES,
      storageSteps.STORAGE_QUEUES,
      storageSteps.STORAGE_TABLES,
      STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS,
      STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENTS,
      STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_PRINCIPAL_RELATIONSHIPS,
      STEP_RM_AUTHORIZATION_ROLE_ASSIGNMENT_SCOPE_RELATIONSHIPS,
      STEP_RM_AUTHORIZATION_ROLE_DEFINITIONS,
      STEP_RM_AUTHORIZATION_CLASSIC_ADMINISTRATORS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      subscriptionSteps.SUBSCRIPTIONS,
      subscriptionSteps.LOCATIONS,
      STEP_RM_API_MANAGEMENT_SERVICES,
      STEP_RM_API_MANAGEMENT_APIS,
      STEP_RM_DNS_ZONES,
      STEP_RM_DNS_RECORD_SETS,
      STEP_RM_PRIVATE_DNS_ZONES,
      STEP_RM_PRIVATE_DNS_RECORD_SETS,
      STEP_RM_CONTAINER_REGISTRIES,
      STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
      STEP_RM_SERVICE_BUS_NAMESPACES,
      STEP_RM_SERVICE_BUS_QUEUES,
      STEP_RM_SERVICE_BUS_TOPICS,
      STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
      STEP_RM_CDN_PROFILE,
      STEP_RM_CDN_ENDPOINTS,
      STEP_RM_BATCH_ACCOUNT,
      STEP_RM_BATCH_POOL,
      STEP_RM_BATCH_APPLICATION,
      STEP_RM_BATCH_CERTIFICATE,
      STEP_RM_REDIS_CACHES,
      STEP_RM_REDIS_FIREWALL_RULES,
      STEP_RM_REDIS_LINKED_SERVERS,
      STEP_RM_CONTAINER_GROUPS,
      STEP_RM_EVENT_GRID_DOMAINS,
      STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
      STEP_RM_EVENT_GRID_TOPICS,
      STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
      STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
      SecuritySteps.ASSESSMENTS,
      SecuritySteps.SECURITY_CENTER_CONTACTS,
      SecuritySteps.PRICING_CONFIGURATIONS,
      MonitorSteps.MONITOR_LOG_PROFILES,
      MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS,
    ],
    executeLastSteps: [
      AdvisorSteps.RECOMMENDATIONS,
      PolicySteps.POLICY_ASSIGNMENTS,
      MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS,
    ],
  };
}

export default function getStepStartStates(
  executionContext: IntegrationExecutionContext<IntegrationConfig>,
): StepStartStates {
  const config = executionContext.instance.config || {};

  const activeDirectory = { disabled: !config.ingestActiveDirectory };
  const resourceManager = { disabled: !hasSubscriptionId(config) };

  const {
    executeFirstSteps: adFirstSteps,
    executeLastSteps: adLastSteps,
  } = getActiveDirectorySteps();
  const {
    executeFirstSteps: rmFirstSteps,
    executeLastSteps: rmLastSteps,
  } = getResourceManagerSteps();
  return {
    [STEP_AD_ACCOUNT]: { disabled: false },
    ...makeStepStartStates([...adFirstSteps, ...adLastSteps], activeDirectory),
    ...makeStepStartStates([...rmFirstSteps, ...rmLastSteps], resourceManager),
  };
}
