import {
  IntegrationExecutionContext,
  StepStartStates,
  StepStartState,
  IntegrationInfoEventName,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './types';
import { hasSubscriptionId } from './utils/hasSubscriptionId';

import {
  STEP_AD_ACCOUNT,
  STEP_AD_GROUP_MEMBERS,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  STEP_AD_SERVICE_PRINCIPALS,
  STEP_AD_USER_REGISTRATION_DETAILS,
  STEP_AD_ROLE_ASSIGNMENTS,
  STEP_AD_ROLE_DEFINITIONS,
  STEP_AD_DEVICES,
} from './steps/active-directory/constants';
import { steps as authorizationSteps } from './steps/resource-manager/authorization/constants';
import { steps as computeSteps } from './steps/resource-manager/compute/constants';
import { STEP_RM_COSMOSDB_SQL_DATABASES } from './steps/resource-manager/cosmosdb/constants';
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
  STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
  STEP_RM_NETWORK_SECURITY_GROUPS,
  STEP_RM_NETWORK_VIRTUAL_NETWORKS,
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
import {
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
  STEP_RM_RESOURCES_RESOURCE_LOCKS,
  STEP_RM_RESOURCES_RESOURCE_HAS_LOCK,
} from './steps/resource-manager/resources/constants';
import { steps as subscriptionSteps } from './steps/resource-manager/subscriptions/constants';
import {
  STEP_RM_API_MANAGEMENT_APIS,
  STEP_RM_API_MANAGEMENT_SERVICES,
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
  STEP_RM_SERVICE_BUS_QUEUES,
  STEP_RM_SERVICE_BUS_TOPICS,
  STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
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
  STEP_EVENT_HUB_NAMESPACE,
  STEP_AZURE_CONSUMER_GROUP,
  STEP_EVENT_HUB_CLUSTER,
  STEP_EVENT_HUB_KEYS,
  EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
  EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
  STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
  STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
} from './steps/resource-manager/event-hub/constants';
import { AdvisorSteps } from './steps/resource-manager/advisor/constants';
import { SecuritySteps } from './steps/resource-manager/security/constants';
import { PolicySteps } from './steps/resource-manager/policy/constants';
import { MonitorSteps } from './steps/resource-manager/monitor/constants';
import { AppServiceSteps } from './steps/resource-manager/appservice/constants';
import { PolicyInsightSteps } from './steps/resource-manager/policy-insights/constants';
// import { ManagementGroupSteps } from './steps/resource-manager/management-groups/constants';
import { STEP_RM_CONTAINER_SERVICES_CLUSTERS } from './steps/resource-manager/container-services/constants';
import { FrontDoorStepIds } from './steps/resource-manager/frontdoor/constants';
import { J1SubscriptionClient } from './steps/resource-manager/subscriptions/client';
import { STEP_AZURE_APPLICATION_SECURITY_GROUP } from './steps/resource-manager/application-security-group/constants';
import {
  STEP_AZURE_APPLICATION_GATEWAY,
  STEP_AZURE_BGP_SERVICE_COMMUNITIES,
} from './steps/resource-manager/express-route/constants';
import { SYNAPSE_STEPS } from './steps/resource-manager/synapse/constant';
import { DdosSteps } from './steps/resource-manager/ddos/constant';

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
      STEP_AD_DEVICES,
      STEP_AD_GROUPS,
      STEP_AD_GROUP_MEMBERS,
      STEP_AD_USER_REGISTRATION_DETAILS,
      STEP_AD_USERS,
      STEP_AD_SERVICE_PRINCIPALS,
      STEP_AD_ROLE_ASSIGNMENTS,
      STEP_AD_ROLE_DEFINITIONS,
      subscriptionSteps.ALL_SKIPPED_SUBSCRIPTIONS,
    ],
    executeLastSteps: [],
  };
}

export function getManagementGroupSteps(): GetApiSteps {
  return {
    executeFirstSteps: [
      // ManagementGroupSteps.MANAGEMENT_GROUPS
    ],
    executeLastSteps: [],
  };
}

export function getResourceManagerSteps(): GetApiSteps {
  return {
    executeFirstSteps: [
      STEP_RM_KEYVAULT_VAULTS,
      STEP_RM_KEYVAULT_KEYS,
      STEP_RM_KEYVAULT_SECRETS,
      KeyVaultStepIds.KEY_VAULT_PRINCIPAL_RELATIONSHIPS,
      KeyVaultStepIds.KEY_VAULT_DIAGNOSTIC_SETTINGS,
      STEP_RM_NETWORK_VIRTUAL_NETWORKS,
      STEP_RM_NETWORK_SECURITY_GROUPS,
      STEP_RM_NETWORK_FIREWALL_RULE_RELATIONSHIPS,
      STEP_RM_NETWORK_FIREWALL_POLICY_RELATIONSHIPS,
      STEP_RM_NETWORK_SECURITY_GROUP_RULE_RELATIONSHIPS,
      STEP_AZURE_APPLICATION_SECURITY_GROUP,
      STEP_RM_NETWORK_INTERFACES,
      STEP_RM_NETWORK_PUBLIC_IP_ADDRESSES,
      STEP_RM_NETWORK_LOAD_BALANCERS,
      STEP_RM_NETWORK_FIREWALLS,
      STEP_RM_NETWORK_FIREWALL_POLICIES,
      STEP_RM_NETWORK_WATCHERS,
      STEP_RM_NETWORK_LOCATION_WATCHERS,
      STEP_RM_NETWORK_FLOW_LOGS,
      computeSteps.COMPUTE_VIRTUAL_MACHINE_IMAGES,
      computeSteps.COMPUTE_VIRTUAL_MACHINE_DISKS,
      computeSteps.COMPUTE_VIRTUAL_MACHINES,
      STEP_RM_NETWORK_PRIVATE_ENDPOINTS,
      STEP_RM_NETWORK_PRIVATE_ENDPOINT_SUBNET_RELATIONSHIPS,
      STEP_RM_NETWORK_PRIVATE_ENDPOINTS_NIC_RELATIONSHIPS,
      computeSteps.GALLERIES,
      computeSteps.SHARED_IMAGES,
      computeSteps.SHARED_IMAGE_VERSIONS,
      computeSteps.SHARED_IMAGE_VERSION_SOURCE_RELATIONSHIPS,
      computeSteps.VIRTUAL_MACHINE_EXTENSIONS,
      computeSteps.VIRTUAL_MACHINE_DISK_RELATIONSHIPS,
      computeSteps.VIRTUAL_MACHINE_IMAGE_RELATIONSHIPS,
      computeSteps.VIRTUAL_MACHINE_MANAGED_IDENTITY_RELATIONSHIPS,
      computeSteps.VIRTUAL_MACHINE_SCALE_SETS,
      computeSteps.VIRTUAL_MACHINE_SCALE_SETS_RELATIONSHIPS,
      computeSteps.VM_SCALE_SETS_IMAGE_RELATIONSHIPS,
      STEP_RM_COSMOSDB_SQL_DATABASES,
      STEP_RM_DATABASE_MARIADB_DATABASES,
      STEP_RM_DATABASE_MARIADB_DATABASES_DIAGNOSTIC_SETTINGS,
      STEP_RM_DATABASE_MYSQL_DATABASES,
      STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
      postgreSqlDatabaseSteps.SERVERS,
      postgreSqlDatabaseSteps.SERVERS_DIAGNOSTIC_SETTINGS,
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
      authorizationSteps.ROLE_ASSIGNMENTS,
      authorizationSteps.ROLE_ASSIGNMENT_PRINCIPALS,
      authorizationSteps.ROLE_DEFINITIONS,
      authorizationSteps.ROLE_ASSIGNMENT_DEFINITIONS,
      authorizationSteps.CLASSIC_ADMINS,
      STEP_RM_RESOURCES_RESOURCE_GROUPS,
      STEP_RM_RESOURCES_RESOURCE_LOCKS,
      subscriptionSteps.SUBSCRIPTION,
      subscriptionSteps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS,
      subscriptionSteps.LOCATIONS,
      subscriptionSteps.USAGE_DETAILS,
      STEP_RM_API_MANAGEMENT_SERVICES,
      STEP_RM_API_MANAGEMENT_SERVICES_DIAGNOSTIC_SETTINGS,
      STEP_RM_API_MANAGEMENT_APIS,
      STEP_RM_CONTAINER_SERVICES_CLUSTERS,
      STEP_RM_DNS_ZONES,
      STEP_RM_DNS_RECORD_SETS,
      STEP_RM_PRIVATE_DNS_ZONES,
      STEP_RM_PRIVATE_DNS_RECORD_SETS,
      STEP_RM_CONTAINER_REGISTRIES,
      STEP_RM_CONTAINER_REGISTRIES_DIAGNOSTIC_SETTINGS,
      STEP_RM_CONTAINER_REGISTRY_WEBHOOKS,
      STEP_RM_SERVICE_BUS_NAMESPACES,
      STEP_RM_SERVICE_BUS_QUEUES,
      STEP_RM_SERVICE_BUS_TOPICS,
      STEP_RM_SERVICE_BUS_SUBSCRIPTIONS,
      STEP_RM_CDN_PROFILE,
      STEP_RM_CDN_PROFILE_DIAGNOSTIC_SETTINGS,
      STEP_RM_CDN_ENDPOINTS,
      STEP_RM_CDN_ENDPOINTS_DIAGNOSTIC_SETTINGS,
      STEP_RM_BATCH_ACCOUNT,
      STEP_RM_BATCH_ACCOUNT_DIAGNOSTIC_SETTINGS,
      STEP_RM_BATCH_POOL,
      STEP_RM_BATCH_APPLICATION,
      STEP_RM_BATCH_CERTIFICATE,
      STEP_RM_REDIS_CACHES,
      STEP_RM_REDIS_FIREWALL_RULES,
      STEP_RM_REDIS_LINKED_SERVERS,
      STEP_RM_CONTAINER_GROUPS,
      STEP_RM_EVENT_GRID_DOMAINS,
      STEP_RM_EVENT_GRID_DOMAINS_DIAGNOSTIC_SETTINGS,
      STEP_RM_EVENT_GRID_DOMAIN_TOPICS,
      STEP_RM_EVENT_GRID_TOPICS,
      STEP_RM_EVENT_GRID_TOPICS_DIAGNOSTIC_SETTINGS,
      STEP_RM_EVENT_GRID_TOPIC_SUBSCRIPTIONS,
      STEP_RM_EVENT_GRID_DOMAIN_TOPIC_SUBSCRIPTIONS,
      STEP_EVENT_HUB_NAMESPACE,
      STEP_EVENT_HUB_KEYS,
      STEP_AZURE_EVENT_HUB,
      STEP_AZURE_CONSUMER_GROUP,
      STEP_EVENT_HUB_CLUSTER,
      STEP_EVENT_HUB_CLUSTER_ASSIGNED_EVENT_HUB_NAMESPACE_RELATION,
      STEP_AZURE_CONSUMER_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
      STEP_AZURE_SUBSCRIPTION_HAS_AZURE_EVENT_HUB_RELATION,
      STEP_AZURE_RESOURCE_GROUP_HAS_AZURE_EVENT_HUB_RELATION,
      EVENT_HUB_NAMESPACE_HAS_AZURE_EVENT_HUB_RELATION,
      EVENT_HUB_NAMESPACE_HAS_EVENT_HUB_KEY_RELATION,
      // STEP_AZURE_EXPRESS_ROUTE_CIRCUIT,
      STEP_AZURE_BGP_SERVICE_COMMUNITIES,
      STEP_AZURE_APPLICATION_GATEWAY,
      SecuritySteps.ASSESSMENTS,
      SecuritySteps.SECURITY_CENTER_CONTACTS,
      SecuritySteps.SETTINGS,
      SecuritySteps.AUTO_PROVISIONING_SETTINGS,
      SecuritySteps.PRICING_CONFIGURATIONS,
      MonitorSteps.MONITOR_LOG_PROFILES,
      MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS,
      PolicySteps.POLICY_ASSIGNMENTS,
      PolicySteps.POLICY_DEFINITIONS,
      AppServiceSteps.APPS,
      AppServiceSteps.APP_SERVICE_PLANS,
      AppServiceSteps.APP_TO_SERVICE_RELATIONSHIPS,
      PolicyInsightSteps.SUBSCRIPTION_POLICY_STATES,
      PolicyInsightSteps.POLICY_STATE_TO_ASSIGNMENT_RELATIONSHIPS,
      PolicyInsightSteps.POLICY_STATE_TO_DEFINITION_RELATIONSHIPS,
      SYNAPSE_STEPS.SYNAPSE_SERVICE,
      SYNAPSE_STEPS.SYNAPSE_WORKSPACES,
      SYNAPSE_STEPS.SYNAPSE_SERVICE_WORKSPACE_RELATIONSHIP,
      SYNAPSE_STEPS.SYNAPSE_SQL_POOL,
      SYNAPSE_STEPS.SYNAPSE_SERVICE_SQL_POOL_RELATIONSHIP,
      SYNAPSE_STEPS.SYNAPSE_WORKSPACE_SQL_POOL_RELATIONSHIP,
      SYNAPSE_STEPS.SYNAPSE_KEYS,
      SYNAPSE_STEPS.SYNAPSE_SERVICE_KEY_RELATIONSHIP,
      SYNAPSE_STEPS.SYNAPSE_WORKSPACE_KEYS_RELATIONSHIP,
      SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_POLICY,
      SYNAPSE_STEPS.SYNAPSE_DATA_MASKING_RULE,
      SYNAPSE_STEPS.SYNAPSE_SQL_POOL_DATA_MASKING_POLICY_RELATIONSHIP,
      SYNAPSE_STEPS.KEY_VAULT_SERVICE_SYNAPSE_KEY_RELATIONSHIP,
      DdosSteps.PROTECTION_PLAN,
      DdosSteps.DDOS_PROTECTION_PLAN_PUBLIC_IP_RELATIONSHIP,
      DdosSteps.DDOS_PROTECTION_PLAN_VNET_RELATIONSHIP,
      DdosSteps.RESOURCE_GROUPS_DDOS_PROTECTION_PLAN_RELATIONSHIP,
      ...Object.values(FrontDoorStepIds),
    ],
    executeLastSteps: [
      AdvisorSteps.RECOMMENDATIONS,
      AdvisorSteps.ASSESSMENT_RECOMMENDATION_RELATIONSHIP,
      AdvisorSteps.RESOURCE_RECOMMENDATION_RELATIONSHIP,
      authorizationSteps.ROLE_ASSIGNMENT_SCOPES,
      PolicySteps.POLICY_ASSIGNMENT_SCOPE_RELATIONSHIPS,
      MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS,
      STEP_RM_NETWORK_PRIVATE_ENDPOINTS_RESOURCE_RELATIONSHIPS,
      PolicyInsightSteps.POLICY_STATE_TO_RESOURCE_RELATIONSHIPS,
      STEP_RM_RESOURCES_RESOURCE_HAS_LOCK,
    ],
  };
}

export default async function getStepStartStates(
  executionContext: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  const config = executionContext.instance.config || {};
  //Disable all the steps for subscriptions named 'Access to Azure Active Directory'
  //These subscriptions do NOT host Azure AD. These are legacy subscriptions that can no longer be managed by customer portal. We decided not to execute any step, but just show an event.
  //If any step executes we get: 'The current subscription type is not permitted to perform operations on any provider namespace. Please use a different subscription.'
  //More info:
  //https://www.jasonfritts.me/2020/04/07/what-is-the-access-to-azure-active-directory-subscription-for/#:%7E:text=The%20%E2%80%9CAccess%20to%20Azure%20Active%20Directory%E2%80%9D%20subscriptions%20are%20a%20legacy,portal.azure.com
  const logger = executionContext.logger;
  let disableAllSteps = false;
  if (hasSubscriptionId(config)) {
    const subscriptionClient = new J1SubscriptionClient(config, logger);
    try {
      const subscription = await subscriptionClient.getSubscription(
        config.subscriptionId!,
      );
      if (!subscription?.displayName) {
        logger.warn(
          { subscriptionId: config.subscriptionId },
          'Could not get subscription for subscriptionId',
        );
      } else if (
        subscription.displayName === 'Access to Azure Active Directory'
      ) {
        disableAllSteps = true;
        logger.publishInfoEvent({
          name: IntegrationInfoEventName.Results,
          description:
            'This is an "Access to Azure Active Directory" subscription, which is a legacy subscription type that is no longer used. They were used prior to the current Azure Portal (https://portal.azure.com/). JupiterOne cannot ingest any resources from this subscription.',
        });
      }
    } catch (e) {
      logger.warn(
        { e },
        'Could not get subscription displayName in getStepStartStates',
      );
    }
  }
  const activeDirectory = {
    disabled: !config.ingestActiveDirectory || disableAllSteps,
  };
  const resourceManager = {
    disabled: !hasSubscriptionId(config) || disableAllSteps,
  };
  const managementGroups = {
    disabled: !config.configureSubscriptionInstances || disableAllSteps,
  };

  const { executeFirstSteps: adFirstSteps, executeLastSteps: adLastSteps } =
    getActiveDirectorySteps();
  const { executeFirstSteps: rmFirstSteps, executeLastSteps: rmLastSteps } =
    getResourceManagerSteps();
  const { executeFirstSteps: mgFirstSteps, executeLastSteps: mgLastSteps } =
    getManagementGroupSteps();
  return {
    [STEP_AD_ACCOUNT]: { disabled: false },
    ...makeStepStartStates([...adFirstSteps, ...adLastSteps], activeDirectory),
    ...makeStepStartStates([...rmFirstSteps, ...rmLastSteps], resourceManager),
    ...makeStepStartStates([...mgFirstSteps, ...mgLastSteps], managementGroups),
  };
}
