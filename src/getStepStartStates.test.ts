/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';

import getStepStartStates, {
  getActiveDirectorySteps,
  getResourceManagerSteps,
  getManagementGroupSteps,
} from './getStepStartStates';
import { invocationConfig } from './index';
import {
  STEP_AD_ACCOUNT,
  STEP_AD_GROUP_MEMBERS,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  STEP_AD_SERVICE_PRINCIPALS,
  STEP_AD_USER_REGISTRATION_DETAILS,
  STEP_AD_ROLE_ASSIGNMENTS,
  STEP_AD_SERVICE_PRINCIPAL_ACCESS,
  STEP_AD_ROLE_DEFINITIONS,
  STEP_AD_DEVICES,
} from './steps/active-directory/constants';
import {
  STEP_ACCESS_PACKAGE,
  STEP_ACCESS_PACKAGE_ASSIGNMENT,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
  STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_RESOURCE_APPLICATION,
  STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
} from './steps/resource-manager/access-groups/constants';
import { steps as computeSteps } from './steps/resource-manager/compute/constants';
import { STEP_RM_COSMOSDB_SQL_DATABASES } from './steps/resource-manager/cosmosdb/constants';
import { Steps } from './steps/resource-manager/container-services/constants';
import {
  STEP_RM_DATABASE_MARIADB_DATABASES,
  STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS,
  STEP_RM_DATABASE_MYSQL_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
} from './steps/resource-manager/databases/constants';
import { steps as postgreSqlDatabaseSteps } from './steps/resource-manager/databases/postgresql/constants';
import { steps as sqlDatabaseSteps } from './steps/resource-manager/databases/sql/constants';
import { STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS } from './steps/resource-manager/interservice/constants';
import {
  STEP_RM_KEYVAULT_VAULTS,
  STEP_RM_KEYVAULT_KEYS,
  STEP_RM_KEYVAULT_SECRETS,
  KeyVaultStepIds,
} from './steps/resource-manager/key-vault/constants';
import {
  STEP_RM_NETWORK_INTERFACES,
  STEP_RM_NETWORK_LOAD_BALANCERS,
  STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
  STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
  STEP_RM_NETWORK_FIREWALLS,
  STEP_RM_NETWORK_WATCHERS,
  STEP_RM_NETWORK_FLOW_LOGS,
  STEP_RM_NETWORK_LOCATION_WATCHERS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS,
  STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS,
  STEP_RM_NETWORK_FIREWALL_POLICIES,
  STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
  STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
} from './steps/resource-manager/network/constants';
import { steps as storageSteps } from './steps/resource-manager/storage/constants';
import { IntegrationConfig } from './types';
import { steps as authorizationSteps } from './steps/resource-manager/authorization/constants';
import {
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
  STEP_RM_RESOURCES_RESOURCE_LOCKS,
  STEP_RM_RESOURCES_RESOURCE_HAS_LOCK,
} from './steps/resource-manager/resources/constants';
import { steps as subscriptionSteps } from './steps/resource-manager/subscriptions/constants';
import {
  STEP_RM_API_MANAGEMENT_SERVICES,
  STEP_RM_API_MANAGEMENT_APIS,
  STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS,
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
  STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS,
  STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
} from './steps/resource-manager/container-registry/constants';
import {
  STEP_RM_SERVICE_BUS_NAMESPACES,
  STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
  STEP_RM_SERVICE_BUS_QUEUES,
  STEP_RM_SERVICE_BUS_TOPICS,
} from './steps/resource-manager/service-bus/constants';
import {
  STEP_RM_CDN_PROFILE,
  STEP_RM_CDN_ENDPOINTS,
  STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS,
  STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS,
} from './steps/resource-manager/cdn/constants';
import {
  STEP_RM_BATCH_ACCOUNT,
  STEP_RM_BATCH_POOL,
  STEP_RM_BATCH_APPLICATION,
  STEP_RM_BATCH_CERTIFICATE,
  STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS,
} from './steps/resource-manager/batch/constants';
import {
  STEP_RM_REDIS_CACHES,
  STEP_RM_REDIS_FIREWALL_RULES,
  STEP_RM_REDIS_LINKED_SERVERS,
} from './steps/resource-manager/redis-cache/constants';
import { STEP_RM_CONTAINER_GROUPS } from './steps/resource-manager/container-instance/constants';
import {
  STEP_RM_EVENT_GRID_DOMAINS,
  STEP_RM_EVENT_GRID_DOMAINS_DIAGNOSTIC_SETTINGS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
  STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
  STEP_RM_EVENT_GRID_TOPICS,
  STEP_RM_EVENT_GRID_TOPICS_DIAGNOSTIC_SETTINGS,
  STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
} from './steps/resource-manager/event-grid/constants';
import {
  STEP_AZURE_EVENT_HUB,
  STEP_AZURE_CONSUMER_GROUP,
  STEP_EVENT_HUB_CLUSTER,
  STEP_EVENT_HUB_NAMESPACE,
  STEP_EVENT_HUB_KEYS,
  STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION,
  STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
  EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
  STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION,
  EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
} from './steps/resource-manager/event-hub/constants';
import {
  STEP_AZURE_APPLICATION_SECURITY_GROUP,
  STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION,
} from './steps/resource-manager/application-security-group/constants';
import { DdosSteps } from './steps/resource-manager/ddos/constant';
import {
  STEP_AZURE_EXPRESS_ROUTE,
  STEP_AZURE_APPLICATION_GATEWAY,
  STEP_AZURE_BGP_SERVICE_COMMUNITIES,
  STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT,
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION,
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
  STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION,
} from './steps/resource-manager/express-route/constants';
import { SYNAPSE_STEPS } from './steps/resource-manager/synapse/constant';
import { AdvisorSteps } from './steps/resource-manager/advisor/constants';
import { SecuritySteps } from './steps/resource-manager/security/constants';
import { PolicySteps } from './steps/resource-manager/policy/constants';
import { MonitorSteps } from './steps/resource-manager/monitor/constants';
import { AppServiceSteps } from './steps/resource-manager/appservice/constants';
import { PolicyInsightSteps } from './steps/resource-manager/policy-insights/constants';
import { ManagementGroupSteps } from './steps/resource-manager/management-groups/constants';
import { Step } from '@jupiterone/integration-sdk-core';
import { STEP_RM_CONTAINER_SERVICES_CLUSTERS } from './steps/resource-manager/container-services/constants';
import { FrontDoorStepIds } from './steps/resource-manager/frontdoor/constants';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../test/helpers/recording';
import { configFromEnv } from '../test/integrationInstanceConfig';

describe('getStepStartStates', () => {
  test('all steps represented', async () => {
    const context = createMockExecutionContext<IntegrationConfig>();
    const states = await getStepStartStates(context);
    const stepIds = invocationConfig.integrationSteps.map((s) => s.id);
    expect(Object.keys(states).sort()).toEqual(stepIds.sort());
  });

  test('empty config', async () => {
    const context = createMockExecutionContext<IntegrationConfig>();
    const states = await getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: true },
      [STEP_AD_GROUP_MEMBERS]: { disabled: true },
      [STEP_AD_USER_REGISTRATION_DETAILS]: { disabled: true },
      [STEP_AD_ROLE_ASSIGNMENTS]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPAL_ACCESS]: { disabled: true },

      [subscriptionSteps.ALL_SKIPPED_SUBSCRIPTIONS]: { disabled: true },
      [STEP_AD_ROLE_DEFINITIONS]: { disabled: true },
      [STEP_AD_USERS]: { disabled: true },
      [STEP_AD_DEVICES]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: true },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_KEYVAULT_KEYS]: { disabled: true },
      [STEP_RM_KEYVAULT_SECRETS]: { disabled: true },
      [KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS]: { disabled: true },
      [KeyVaultStepIds.KEY_VAULT_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: true },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALLS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_POLICIES]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: true },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS]: { disabled: true },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [computeSteps.COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [computeSteps.GALLERIES]: { disabled: true },
      [computeSteps.SHARED_IMAGES]: { disabled: true },
      [computeSteps.SHARED_IMAGE_VERSIONS]: { disabled: true },
      [computeSteps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: true,
      },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: true,
      },
      [sqlDatabaseSteps.SERVERS]: { disabled: true },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [sqlDatabaseSteps.DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: true },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: true },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: true },
      [storageSteps.STORAGE_QUEUES]: { disabled: true },
      [storageSteps.STORAGE_TABLES]: { disabled: true },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENTS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_SCOPES]: { disabled: true },
      [authorizationSteps.ROLE_DEFINITIONS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS]: { disabled: true },
      [authorizationSteps.CLASSIC_ADMINS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_LOCKS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_HAS_LOCK]: { disabled: true },
      [subscriptionSteps.SUBSCRIPTION]: { disabled: true },
      [subscriptionSteps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [subscriptionSteps.LOCATIONS]: { disabled: true },
      [subscriptionSteps.USAGE_DETAILS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: true },
      [STEP_RM_DNS_ZONES]: { disabled: true },
      [STEP_RM_CONTAINER_SERVICES_CLUSTERS]: { disabled: true },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_CDN_PROFILE]: { disabled: true },
      [STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_BATCH_POOL]: { disabled: true },
      [STEP_RM_BATCH_APPLICATION]: { disabled: true },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: true },
      [STEP_RM_REDIS_CACHES]: { disabled: true },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: true },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: true },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [Steps.ACCESS_ROLE]: { disabled: true },
      [Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE]: { disabled: true },
      [Steps.KUBERNETES_SERVICE]: { disabled: true },
      [Steps.ROLE_BINDING]: { disabled: true },
      [Steps.MANAGED_CLUSTER_CONTAINS_ROLE_BINDING]: { disabled: true },
      [Steps.MAINTENANCE_CONFIGURATION]: { disabled: true },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_KEYS]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_KEY_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACES]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_EVENT_HUB]: { disabled: true },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP]: { disabled: true },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_CLUSTER]: { disabled: true },
      [STEP_AZURE_CONSUMER_GROUP]: { disabled: true },
      [STEP_EVENT_HUB_KEYS]: { disabled: true },
      [STEP_EVENT_HUB_NAMESPACE]: { disabled: true },
      [STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION]: { disabled: true },
      [EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION]: { disabled: true },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION]: { disabled: true },
      [EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE]: { disabled: true },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_APPLICATION_GATEWAY]: { disabled: true },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES]: { disabled: true },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION]: { disabled: true },
      [DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP]: {
        disabled: true,
      },
      [DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP]: { disabled: true },
      [DdosSteps.PROTECTION_PLAN]: { disabled: true },
      [DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_ACCESS_PACKAGE]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST]: { disabled: true },
      [STEP_ACCESS_PACKAGE_RESOURCE_APPLICATION]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP]:
        { disabled: true },
      [STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP]:
        { disabled: true },
      [STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: true,
      },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: true },
      [AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP]: { disabled: true },
      [AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: true },
      [PolicySteps.POLICY_DEFINITIONS]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS]: { disabled: true },
      [SecuritySteps.ASSESSMENTS]: { disabled: true },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: true },
      [SecuritySteps.SETTINGS]: { disabled: true },
      [SecuritySteps.AUTO_PROVISIONING_SETTINGS]: { disabled: true },
      [SecuritySteps.DEFENDER_ALERTS]: { disabled: true },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: true },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
      [AppServiceSteps.APPS]: { disabled: true },
      [AppServiceSteps.APP_SERVICE_PLANS]: { disabled: true },
      [AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS]: { disabled: true },
      [PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES]: { disabled: true },
      [PolicyInsightSteps.POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS]: {
        disabled: true,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_DEFINITION_RELATIONSHIPS]: {
        disabled: true,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_RESOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [ManagementGroupSteps.MANAGEMENT_GROUPS]: {
        disabled: true,
      },
      [FrontDoorStepIds.FETCH_FRONTDOORS]: { disabled: true },
      [FrontDoorStepIds.FETCH_RULES_ENGINES]: { disabled: true },
      [FrontDoorStepIds.FETCH_ROUTING_RULES]: { disabled: true },
      [FrontDoorStepIds.FETCH_BACKEND_POOLS]: { disabled: true },
      [FrontDoorStepIds.FETCH_FRONTEND_ENDPOINTS]: { disabled: true },
    });
  });

  test('ingestActiveDirectory: true', async () => {
    const context = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: { ingestActiveDirectory: true } as IntegrationConfig,
    });
    const states = await getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: false },
      [STEP_AD_GROUP_MEMBERS]: { disabled: false },
      [STEP_AD_USER_REGISTRATION_DETAILS]: { disabled: false },
      [STEP_AD_ROLE_ASSIGNMENTS]: { disabled: false },
      [STEP_AD_SERVICE_PRINCIPAL_ACCESS]: { disabled: false },
      [subscriptionSteps.ALL_SKIPPED_SUBSCRIPTIONS]: { disabled: false },
      [STEP_AD_ROLE_DEFINITIONS]: { disabled: false },
      [STEP_AD_USERS]: { disabled: false },
      [STEP_AD_DEVICES]: { disabled: false },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: false },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_KEYVAULT_KEYS]: { disabled: true },
      [STEP_RM_KEYVAULT_SECRETS]: { disabled: true },
      [KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS]: { disabled: true },
      [KeyVaultStepIds.KEY_VAULT_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: true },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALLS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_POLICIES]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: true },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS]: { disabled: true },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [computeSteps.COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [computeSteps.GALLERIES]: { disabled: true },
      [computeSteps.SHARED_IMAGES]: { disabled: true },
      [computeSteps.SHARED_IMAGE_VERSIONS]: { disabled: true },
      [computeSteps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: true,
      },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: true,
      },
      [sqlDatabaseSteps.SERVERS]: { disabled: true },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [sqlDatabaseSteps.DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: true },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: true },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: true },
      [storageSteps.STORAGE_QUEUES]: { disabled: true },
      [storageSteps.STORAGE_TABLES]: { disabled: true },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENTS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_SCOPES]: { disabled: true },
      [authorizationSteps.ROLE_DEFINITIONS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS]: { disabled: true },
      [authorizationSteps.CLASSIC_ADMINS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_LOCKS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_HAS_LOCK]: { disabled: true },
      [subscriptionSteps.SUBSCRIPTION]: { disabled: true },
      [subscriptionSteps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [subscriptionSteps.LOCATIONS]: { disabled: true },
      [subscriptionSteps.USAGE_DETAILS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: true },
      [STEP_RM_DNS_ZONES]: { disabled: true },
      [STEP_RM_CONTAINER_SERVICES_CLUSTERS]: { disabled: true },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_CDN_PROFILE]: { disabled: true },
      [STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_BATCH_POOL]: { disabled: true },
      [STEP_RM_BATCH_APPLICATION]: { disabled: true },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: true },
      [STEP_RM_REDIS_CACHES]: { disabled: true },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: true },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: true },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [Steps.ACCESS_ROLE]: { disabled: true },
      [Steps.ROLE_BINDING]: { disabled: true },
      [Steps.MANAGED_CLUSTER_CONTAINS_ROLE_BINDING]: { disabled: true },
      [Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE]: { disabled: true },
      [Steps.KUBERNETES_SERVICE]: { disabled: true },
      [Steps.MAINTENANCE_CONFIGURATION]: { disabled: true },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_KEYS]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_KEY_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACES]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_EVENT_HUB]: { disabled: true },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP]: { disabled: true },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_CLUSTER]: { disabled: true },
      [STEP_AZURE_CONSUMER_GROUP]: { disabled: true },
      [STEP_EVENT_HUB_KEYS]: { disabled: true },
      [STEP_EVENT_HUB_NAMESPACE]: { disabled: true },
      [STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION]: { disabled: true },
      [EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION]: { disabled: true },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_ACCESS_PACKAGE]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST]: { disabled: true },
      [STEP_ACCESS_PACKAGE_RESOURCE_APPLICATION]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP]:
        { disabled: true },
      [STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP]:
        { disabled: true },
      [STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION]: { disabled: true },
      [EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE]: { disabled: true },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_APPLICATION_GATEWAY]: { disabled: true },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES]: { disabled: true },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION]: { disabled: true },
      [DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP]: {
        disabled: true,
      },
      [DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP]: { disabled: true },
      [DdosSteps.PROTECTION_PLAN]: { disabled: true },
      [DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP]: {
        disabled: true,
      },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: true },
      [AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP]: { disabled: true },
      [AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: true },
      [PolicySteps.POLICY_DEFINITIONS]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS]: { disabled: true },
      [SecuritySteps.ASSESSMENTS]: { disabled: true },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: true },
      [SecuritySteps.SETTINGS]: { disabled: true },
      [SecuritySteps.AUTO_PROVISIONING_SETTINGS]: { disabled: true },
      [SecuritySteps.DEFENDER_ALERTS]: { disabled: true },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: true },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
      [AppServiceSteps.APPS]: { disabled: true },
      [AppServiceSteps.APP_SERVICE_PLANS]: { disabled: true },
      [AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS]: { disabled: true },
      [PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES]: { disabled: true },
      [PolicyInsightSteps.POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS]: {
        disabled: true,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_DEFINITION_RELATIONSHIPS]: {
        disabled: true,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_RESOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [ManagementGroupSteps.MANAGEMENT_GROUPS]: {
        disabled: true,
      },
      [FrontDoorStepIds.FETCH_FRONTDOORS]: { disabled: true },
      [FrontDoorStepIds.FETCH_RULES_ENGINES]: { disabled: true },
      [FrontDoorStepIds.FETCH_ROUTING_RULES]: { disabled: true },
      [FrontDoorStepIds.FETCH_BACKEND_POOLS]: { disabled: true },
      [FrontDoorStepIds.FETCH_FRONTEND_ENDPOINTS]: { disabled: true },
    });
  });

  test("subscriptionId: 'value'", async () => {
    const context = createMockExecutionContext({
      instanceConfig: {
        subscriptionId: '1234',
        directoryId: 'tenantId',
        clientId: 'clientId',
        clientSecret: 'clientSecret',
      } as IntegrationConfig,
    });
    const states = await getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: true },
      [STEP_AD_GROUP_MEMBERS]: { disabled: true },
      [STEP_AD_USER_REGISTRATION_DETAILS]: { disabled: true },
      [STEP_AD_ROLE_ASSIGNMENTS]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPAL_ACCESS]: { disabled: true },
      [subscriptionSteps.ALL_SKIPPED_SUBSCRIPTIONS]: { disabled: true },
      [STEP_AD_ROLE_DEFINITIONS]: { disabled: true },
      [STEP_AD_USERS]: { disabled: true },
      [STEP_AD_DEVICES]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: true },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: false },
      [STEP_RM_KEYVAULT_KEYS]: { disabled: false },
      [STEP_RM_KEYVAULT_SECRETS]: { disabled: false },
      [KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS]: { disabled: false },
      [KeyVaultStepIds.KEY_VAULT_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: false },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: false },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: false },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: false },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: false },
      [STEP_RM_NETWORK_FIREWALLS]: { disabled: false },
      [STEP_RM_NETWORK_FIREWALL_POLICIES]: { disabled: false },
      [STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS]: { disabled: false },
      [STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS]: { disabled: false },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: false },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: false },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: false },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: false },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS]: { disabled: false },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: false },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: false },
      [computeSteps.COMPUTE_VIRTUAL_MACHINES]: { disabled: false },
      [computeSteps.GALLERIES]: { disabled: false },
      [computeSteps.SHARED_IMAGES]: { disabled: false },
      [computeSteps.SHARED_IMAGE_VERSIONS]: { disabled: false },
      [computeSteps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: false },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: false },
      [computeSteps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS]: { disabled: false },
      [computeSteps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS]: {
        disabled: false,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS]: {
        disabled: false,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS]: {
        disabled: false,
      },
      [computeSteps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS]: {
        disabled: false,
      },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: false,
      },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: false },
      [STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: false,
      },
      [sqlDatabaseSteps.SERVERS]: { disabled: false },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [sqlDatabaseSteps.DATABASES]: { disabled: false },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: false },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: false },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: false },
      [postgreSqlDatabaseSteps.SERVERS_DIAGNOSTIC_SETTINGS]: {
        disabled: false,
      },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: false },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: false },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: false },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: false },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: false },
      [storageSteps.STORAGE_QUEUES]: { disabled: false },
      [storageSteps.STORAGE_TABLES]: { disabled: false },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: false },
      [authorizationSteps.ROLE_ASSIGNMENTS]: { disabled: false },
      [authorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS]: { disabled: false },
      [authorizationSteps.ROLE_ASSIGNMENT_SCOPES]: { disabled: false },
      [authorizationSteps.ROLE_DEFINITIONS]: { disabled: false },
      [authorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS]: { disabled: false },
      [authorizationSteps.CLASSIC_ADMINS]: { disabled: false },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: false },
      [STEP_RM_RESOURCES_RESOURCE_LOCKS]: { disabled: false },
      [STEP_RM_RESOURCES_RESOURCE_HAS_LOCK]: { disabled: false },
      [subscriptionSteps.SUBSCRIPTION]: { disabled: false },
      [subscriptionSteps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [subscriptionSteps.LOCATIONS]: { disabled: false },
      [subscriptionSteps.USAGE_DETAILS]: { disabled: false },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: false },
      [STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS]: {
        disabled: false,
      },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: false },
      [STEP_RM_DNS_ZONES]: { disabled: false },
      [STEP_RM_CONTAINER_SERVICES_CLUSTERS]: { disabled: false },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: false },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: false },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: false },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: false },
      [STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: false },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: false },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: false },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: false },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: false },
      [STEP_RM_CDN_PROFILE]: { disabled: false },
      [STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: false },
      [STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: false },
      [STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_BATCH_POOL]: { disabled: false },
      [STEP_RM_BATCH_APPLICATION]: { disabled: false },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: false },
      [STEP_RM_REDIS_CACHES]: { disabled: false },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: false },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: false },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAINS_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: false },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: false },
      [STEP_RM_EVENT_GRID_TOPICS_DIAGNOSTIC_SETTINGS]: { disabled: false },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: false },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: false },
      [Steps.ACCESS_ROLE]: { disabled: false },
      [Steps.ROLE_BINDING]: { disabled: false },
      [Steps.MANAGED_CLUSTER_CONTAINS_ROLE_BINDING]: { disabled: false },
      [Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE]: { disabled: false },
      [Steps.KUBERNETES_SERVICE]: { disabled: false },
      [Steps.MAINTENANCE_CONFIGURATION]: { disabled: false },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: false,
      },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_KEYS]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_KEY_RELATIONSHIP]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP]: {
        disabled: false,
      },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP]: {
        disabled: false,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP]: {
        disabled: false,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP]: {
        disabled: false,
      },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACES]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP]: { disabled: false },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP]: {
        disabled: false,
      },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: false,
      },
      [STEP_ACCESS_PACKAGE]: { disabled: false },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT]: { disabled: false },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY]: { disabled: false },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST]: { disabled: false },
      [STEP_ACCESS_PACKAGE_RESOURCE_APPLICATION]: { disabled: false },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER]: { disabled: false },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP]: {
        disabled: false,
      },
      [STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP]:
        { disabled: false },
      [STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP]: {
        disabled: false,
      },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP]:
        { disabled: false },
      [STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: false,
      },
      [STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: false,
      },
      [STEP_AZURE_EVENT_HUB]: { disabled: false },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP]: { disabled: false },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION]: {
        disabled: false,
      },
      [STEP_EVENT_HUB_CLUSTER]: { disabled: false },
      [STEP_AZURE_CONSUMER_GROUP]: { disabled: false },
      [STEP_EVENT_HUB_KEYS]: { disabled: false },
      [STEP_EVENT_HUB_NAMESPACE]: { disabled: false },
      [STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION]: { disabled: false },
      [EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION]: { disabled: false },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: false,
      },
      [STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: false,
      },
      [STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: false,
      },
      [STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION]: {
        disabled: false,
      },
      [STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION]: { disabled: false },
      [EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION]: { disabled: false },
      [STEP_AZURE_EXPRESS_ROUTE]: { disabled: false },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION]: {
        disabled: false,
      },
      [STEP_AZURE_APPLICATION_GATEWAY]: { disabled: false },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES]: { disabled: false },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION]: {
        disabled: false,
      },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT]: { disabled: false },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION]: { disabled: false },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: false },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: false },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION]: {
        disabled: false,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: false },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION]: {
        disabled: false,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: false },
      [STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION]: { disabled: false },
      [DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP]: {
        disabled: false,
      },
      [DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP]: { disabled: false },
      [DdosSteps.PROTECTION_PLAN]: { disabled: false },
      [DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP]: {
        disabled: false,
      },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: false },
      [AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP]: { disabled: false },
      [AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP]: {
        disabled: false,
      },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: false },
      [PolicySteps.POLICY_DEFINITIONS]: { disabled: false },
      [PolicySteps.POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS]: { disabled: false },
      [SecuritySteps.ASSESSMENTS]: { disabled: false },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: false },
      [SecuritySteps.SETTINGS]: { disabled: false },
      [SecuritySteps.AUTO_PROVISIONING_SETTINGS]: { disabled: false },
      [SecuritySteps.DEFENDER_ALERTS]: { disabled: false },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: false },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: false },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: false },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: false,
      },
      [AppServiceSteps.APPS]: { disabled: false },
      [AppServiceSteps.APP_SERVICE_PLANS]: { disabled: false },
      [AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS]: { disabled: false },
      [PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES]: { disabled: false },
      [PolicyInsightSteps.POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS]: {
        disabled: false,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_DEFINITION_RELATIONSHIPS]: {
        disabled: false,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_RESOURCE_RELATIONSHIPS]: {
        disabled: false,
      },
      [ManagementGroupSteps.MANAGEMENT_GROUPS]: {
        disabled: true,
      },
      [FrontDoorStepIds.FETCH_FRONTDOORS]: { disabled: false },
      [FrontDoorStepIds.FETCH_RULES_ENGINES]: { disabled: false },
      [FrontDoorStepIds.FETCH_ROUTING_RULES]: { disabled: false },
      [FrontDoorStepIds.FETCH_BACKEND_POOLS]: { disabled: false },
      [FrontDoorStepIds.FETCH_FRONTEND_ENDPOINTS]: { disabled: false },
    });
  }, 100_000);

  test('configureSubscriptionInstances: true', async () => {
    const context = createMockExecutionContext({
      instanceConfig: {
        configureSubscriptionInstances: true,
      } as IntegrationConfig,
    });
    const states = await getStepStartStates(context);
    expect(states).toEqual({
      [STEP_AD_ACCOUNT]: { disabled: false },
      [STEP_AD_GROUPS]: { disabled: true },
      [STEP_AD_GROUP_MEMBERS]: { disabled: true },
      [STEP_AD_USER_REGISTRATION_DETAILS]: { disabled: true },
      [STEP_AD_ROLE_ASSIGNMENTS]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPAL_ACCESS]: { disabled: true },
      [subscriptionSteps.ALL_SKIPPED_SUBSCRIPTIONS]: { disabled: true },
      [STEP_AD_ROLE_DEFINITIONS]: { disabled: true },
      [STEP_AD_USERS]: { disabled: true },
      [STEP_AD_DEVICES]: { disabled: true },
      [STEP_AD_SERVICE_PRINCIPALS]: { disabled: true },
      [STEP_RM_KEYVAULT_VAULTS]: { disabled: true },
      [STEP_RM_KEYVAULT_KEYS]: { disabled: true },
      [STEP_RM_KEYVAULT_SECRETS]: { disabled: true },
      [KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS]: { disabled: true },
      [KeyVaultStepIds.KEY_VAULT_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_NETWORK_VIRTUAL_NETWORKS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUPS]: { disabled: true },
      [STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_INTERFACES]: { disabled: true },
      [STEP_RM_NETWORK_LOAD_BALANCERS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALLS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_POLICIES]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS]: { disabled: true },
      [STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES]: { disabled: true },
      [STEP_RM_NETWORK_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_LOCATION_WATCHERS]: { disabled: true },
      [STEP_RM_NETWORK_FLOW_LOGS]: { disabled: true },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS]: { disabled: true },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_IMAGES]: { disabled: true },
      [computeSteps.COMPUTE_VIRTUAL_MACHINE_DISKS]: { disabled: true },
      [computeSteps.COMPUTE_VIRTUAL_MACHINES]: { disabled: true },
      [computeSteps.GALLERIES]: { disabled: true },
      [computeSteps.SHARED_IMAGES]: { disabled: true },
      [computeSteps.SHARED_IMAGE_VERSIONS]: { disabled: true },
      [computeSteps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_EXTENSIONS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS]: { disabled: true },
      [computeSteps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS]: {
        disabled: true,
      },
      [computeSteps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS]: {
        disabled: true,
      },
      [computeSteps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS]: {
        disabled: true,
      },
      [STEP_RM_COSMOSDB_SQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: true,
      },
      [STEP_RM_DATABASE_MYSQL_DATABASES]: { disabled: true },
      [STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS]: {
        disabled: true,
      },
      [sqlDatabaseSteps.SERVERS]: { disabled: true },
      [sqlDatabaseSteps.SERVER_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [sqlDatabaseSteps.DATABASES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [sqlDatabaseSteps.SERVER_AD_ADMINS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVERS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [postgreSqlDatabaseSteps.DATABASES]: { disabled: true },
      [postgreSqlDatabaseSteps.SERVER_FIREWALL_RULES]: { disabled: true },
      [storageSteps.STORAGE_CONTAINERS]: { disabled: true },
      [storageSteps.STORAGE_FILE_SHARES]: { disabled: true },
      [storageSteps.STORAGE_ACCOUNTS]: { disabled: true },
      [storageSteps.STORAGE_QUEUES]: { disabled: true },
      [storageSteps.STORAGE_TABLES]: { disabled: true },
      [STEP_RM_COMPUTE_NETWORK_RELATIONSHIPS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENTS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_SCOPES]: { disabled: true },
      [authorizationSteps.ROLE_DEFINITIONS]: { disabled: true },
      [authorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS]: { disabled: true },
      [authorizationSteps.CLASSIC_ADMINS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_GROUPS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_LOCKS]: { disabled: true },
      [STEP_RM_RESOURCES_RESOURCE_HAS_LOCK]: { disabled: true },
      [subscriptionSteps.SUBSCRIPTION]: { disabled: true },
      [subscriptionSteps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [subscriptionSteps.LOCATIONS]: { disabled: true },
      [subscriptionSteps.USAGE_DETAILS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_API_MANAGEMENT_APIS]: { disabled: true },
      [STEP_RM_DNS_ZONES]: { disabled: true },
      [STEP_RM_CONTAINER_SERVICES_CLUSTERS]: { disabled: true },
      [STEP_RM_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_ZONES]: { disabled: true },
      [STEP_RM_PRIVATE_DNS_RECORD_SETS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_CONTAINER_REGISTRY_WEBHOOKS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_NAMESPACES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_QUEUES]: { disabled: true },
      [STEP_RM_SERVICE_BUS_TOPICS]: { disabled: true },
      [STEP_RM_SERVICE_BUS_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_CDN_PROFILE]: { disabled: true },
      [STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS]: { disabled: true },
      [STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT]: { disabled: true },
      [STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_BATCH_POOL]: { disabled: true },
      [STEP_RM_BATCH_APPLICATION]: { disabled: true },
      [STEP_RM_BATCH_CERTIFICATE]: { disabled: true },
      [STEP_RM_REDIS_CACHES]: { disabled: true },
      [STEP_RM_REDIS_FIREWALL_RULES]: { disabled: true },
      [STEP_RM_REDIS_LINKED_SERVERS]: { disabled: true },
      [STEP_RM_CONTAINER_GROUPS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAINS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPICS_DIAGNOSTIC_SETTINGS]: { disabled: true },
      [STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS]: { disabled: true },
      [Steps.ACCESS_ROLE]: { disabled: true },
      [Steps.ROLE_BINDING]: { disabled: true },
      [Steps.MANAGED_CLUSTER_CONTAINS_ROLE_BINDING]: { disabled: true },
      [Steps.KUBERNETES_SERVICE_CONTAINS_ACCESS_ROLE]: { disabled: true },
      [Steps.KUBERNETES_SERVICE]: { disabled: true },
      [Steps.MAINTENANCE_CONFIGURATION]: { disabled: true },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_KEYS]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_KEY_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_RULE_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACES]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP]: { disabled: true },
      [SYNAPSE_STEPS.SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP]: {
        disabled: true,
      },
      [SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_ACCESS_PACKAGE]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST]: { disabled: true },
      [STEP_ACCESS_PACKAGE_RESOURCE_APPLICATION]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER]: { disabled: true },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP]:
        { disabled: true },
      [STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP]:
        { disabled: true },
      [STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP]: {
        disabled: true,
      },
      [STEP_AZURE_EVENT_HUB]: { disabled: true },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP]: { disabled: true },
      [STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_CLUSTER]: { disabled: true },
      [STEP_AZURE_CONSUMER_GROUP]: { disabled: true },
      [STEP_EVENT_HUB_KEYS]: { disabled: true },
      [STEP_EVENT_HUB_NAMESPACE]: { disabled: true },
      [STEP_AZURE_EVENT_HUB_HAS_LOCATION_RELATION]: { disabled: true },
      [EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION]: { disabled: true },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION]: {
        disabled: true,
      },
      [STEP_EVENT_HUB_KEYS_USES_AZURE_KEY_VAULT_RELATION]: { disabled: true },
      [EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE]: { disabled: true },
      [STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_APPLICATION_GATEWAY]: { disabled: true },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES]: { disabled: true },
      [STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION]: { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_APPLICATION_GATEWAY_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION]: {
        disabled: true,
      },
      [STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION]:
        { disabled: true },
      [STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION]: { disabled: true },
      [DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP]: {
        disabled: true,
      },
      [DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP]: { disabled: true },
      [DdosSteps.PROTECTION_PLAN]: { disabled: true },
      [DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP]: {
        disabled: true,
      },
      [AdvisorSteps.RECOMMENDATIONS]: { disabled: true },
      [AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP]: { disabled: true },
      [AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENTS]: { disabled: true },
      [PolicySteps.POLICY_DEFINITIONS]: { disabled: true },
      [PolicySteps.POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS]: { disabled: true },
      [SecuritySteps.ASSESSMENTS]: { disabled: true },
      [SecuritySteps.SECURITY_CENTER_CONTACTS]: { disabled: true },
      [SecuritySteps.SETTINGS]: { disabled: true },
      [SecuritySteps.AUTO_PROVISIONING_SETTINGS]: { disabled: true },
      [SecuritySteps.DEFENDER_ALERTS]: { disabled: true },
      [SecuritySteps.PRICING_CONFIGURATIONS]: { disabled: true },
      [MonitorSteps.MONITOR_LOG_PROFILES]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS]: { disabled: true },
      [MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS]: {
        disabled: true,
      },
      [AppServiceSteps.APPS]: { disabled: true },
      [AppServiceSteps.APP_SERVICE_PLANS]: { disabled: true },
      [AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS]: { disabled: true },
      [PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES]: { disabled: true },
      [PolicyInsightSteps.POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS]: {
        disabled: true,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_DEFINITION_RELATIONSHIPS]: {
        disabled: true,
      },
      [PolicyInsightSteps.POLICY_STATE_TO_RESOURCE_RELATIONSHIPS]: {
        disabled: true,
      },
      [ManagementGroupSteps.MANAGEMENT_GROUPS]: {
        disabled: false,
      },
      [FrontDoorStepIds.FETCH_FRONTDOORS]: { disabled: true },
      [FrontDoorStepIds.FETCH_RULES_ENGINES]: { disabled: true },
      [FrontDoorStepIds.FETCH_ROUTING_RULES]: { disabled: true },
      [FrontDoorStepIds.FETCH_BACKEND_POOLS]: { disabled: true },
      [FrontDoorStepIds.FETCH_FRONTEND_ENDPOINTS]: { disabled: true },
    });
  });

  test('disable all steps on legacy subscription', async () => {
    const context = createMockExecutionContext({
      instanceConfig: configFromEnv,
    });
    const recording = setupAzureRecording({
      name: 'getStepStartStates',
      directory: __dirname,
      options: {
        matchRequestsBy: getMatchRequestsBy({
          config: context.instance.config,
        }),
      },
    });

    const states = await getStepStartStates(context);
    for (const key in states) {
      expect(states[key].disabled).toBe(key != STEP_AD_ACCOUNT);
    }
    await recording.stop();
  }, 10_000);
});

describe('dependencies', () => {
  test('getActiveDirectorySteps should not depend on non-active directory steps', () => {
    const getApiStepsResponse = getActiveDirectorySteps();

    const activeDirectorySteps = [
      STEP_AD_ACCOUNT,
      ...getApiStepsResponse.executeFirstSteps,
      ...getApiStepsResponse.executeLastSteps,
    ];

    expect(invocationConfig.integrationSteps).toHaveIsolatedDependencies(
      activeDirectorySteps,
    );
  });

  test('getResourceManagerSteps should not depend on non-active directory steps', () => {
    const getApiStepsResponse = getResourceManagerSteps();

    const resourceManagerStepIds = [
      STEP_AD_ACCOUNT,
      STEP_AD_USERS,
      STEP_AD_GROUPS,
      STEP_AD_USER_REGISTRATION_DETAILS,
      ...getApiStepsResponse.executeFirstSteps,
      ...getApiStepsResponse.executeLastSteps,
    ];

    expect(invocationConfig.integrationSteps).toHaveIsolatedDependencies(
      resourceManagerStepIds,
    );
  });

  test('getManagementGroupSteps should not depend on non-active directory steps', () => {
    const getApiStepsResponse = getManagementGroupSteps();

    const managementGroupStepIds = [
      STEP_AD_ACCOUNT,
      ...getApiStepsResponse.executeFirstSteps,
      ...getApiStepsResponse.executeLastSteps,
    ];

    expect(invocationConfig.integrationSteps).toHaveIsolatedDependencies(
      managementGroupStepIds,
    );
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toHaveIsolatedDependencies(stepCollection: string[]): R;
    }
  }
}

expect.extend({
  toHaveIsolatedDependencies(
    integrationSteps: Step<any>[],
    stepCollection: string[],
  ) {
    for (const stepId of stepCollection) {
      const stepDependencies = integrationSteps.find((s) => s.id === stepId)
        ?.dependsOn;
      const invalidStepDependencies = stepDependencies?.filter(
        (s) => !stepCollection.includes(s),
      );
      if (invalidStepDependencies?.length) {
        return {
          message: () =>
            `Step '${stepId}' contains invalid step dependencies: [${invalidStepDependencies}]`,
          pass: false,
        };
      }
    }
    return {
      message: () => '',
      pass: true,
    };
  },
});
