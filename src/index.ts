import {
  IntegrationExecutionContext,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
  IntegrationStepStartStates,
  StepExecutionHandlerFunction,
} from "@jupiterone/integration-sdk";

import { createGraphClient } from "./azure/graph/client";
import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  USER_ENTITY_TYPE,
} from "./jupiterone";
import {
  fetchAccount,
  fetchGroupMembers,
  fetchGroups,
  fetchUsers,
} from "./steps/active-directory";
import {
  ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
  fetchKeyVaults,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from "./steps/resource-manager/key-vault";
import { IntegrationConfig, IntegrationStepContext } from "./types";
import validateInvocation from "./validateInvocation";

export const AD_FETCH_ACCOUNT = "ad-fetch-account";
export const AD_FETCH_GROUPS = "ad-fetch-groups";
export const AD_FETCH_GROUP_MEMBERS = "ad-fetch-group-members";
export const AD_FETCH_USERS = "ad-fetch-users";

export const RM_FETCH_KEYVAULT = "rm-fetch-keyvault";
export const RM_SYNC_COMPUTE = "sync-rm-compute";
export const RM_SYNC_STORAGE = "sync-rm-storage";
export const RM_SYNC_DATABASES = "sync-rm-databases";
export const RM_SYNC_COSMOSDB = "sync-rm-cosmosdb";

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields: {
    clientId: {
      type: "string",
      mask: false,
    },
    clientSecret: {
      type: "string",
      mask: true,
    },
    directoryId: {
      type: "string",
      mask: false,
    },
    subscriptionId: {
      type: "string",
      mask: false,
    },
    ingestActiveDirectory: {
      type: "boolean",
      mask: false,
    },
  },
  validateInvocation,

  getStepStartStates: (
    executionContext: IntegrationExecutionContext<IntegrationConfig>,
  ): IntegrationStepStartStates => {
    const config = executionContext.instance.config || {};

    const activeDirectory = { disabled: !config.ingestActiveDirectory };
    const resourceManager = {
      disabled: typeof config.subscriptionId !== "string",
    };

    let states: IntegrationStepStartStates = {};

    if (activeDirectory.disabled) {
      states = {
        ...states,
        [AD_FETCH_GROUPS]: activeDirectory,
        [AD_FETCH_GROUP_MEMBERS]: activeDirectory,
        [AD_FETCH_USERS]: activeDirectory,
      };
    }

    if (resourceManager.disabled) {
      states = {
        ...states,
        [RM_SYNC_COMPUTE]: resourceManager,
        [RM_FETCH_KEYVAULT]: resourceManager,
        [RM_SYNC_STORAGE]: resourceManager,
        [RM_SYNC_DATABASES]: resourceManager,
        [RM_SYNC_COSMOSDB]: resourceManager,
      };
    }

    return states;
  },

  integrationSteps: [
    {
      id: AD_FETCH_ACCOUNT,
      name: "Fetch Directory Info",
      types: [ACCOUNT_ENTITY_TYPE],
      executionHandler: executionHandlerWithAzureContext(fetchAccount),
    },
    {
      id: AD_FETCH_USERS,
      name: "Fetch AD Users",
      types: [USER_ENTITY_TYPE, ACCOUNT_USER_RELATIONSHIP_TYPE],
      dependsOn: [AD_FETCH_ACCOUNT],
      executionHandler: executionHandlerWithAzureContext(fetchUsers),
    },
    {
      id: AD_FETCH_GROUPS,
      name: "Fetch AD Groups",
      types: [GROUP_ENTITY_TYPE, ACCOUNT_GROUP_RELATIONSHIP_TYPE],
      dependsOn: [AD_FETCH_ACCOUNT],
      executionHandler: executionHandlerWithAzureContext(fetchGroups),
    },
    {
      id: AD_FETCH_GROUP_MEMBERS,
      name: "Fetch AD Group Members",
      types: [GROUP_MEMBER_ENTITY_TYPE, GROUP_MEMBER_RELATIONSHIP_TYPE],
      dependsOn: [AD_FETCH_GROUPS],
      executionHandler: executionHandlerWithAzureContext(fetchGroupMembers),
    },
    {
      id: RM_FETCH_KEYVAULT,
      name: "Fetch Key Vaults",
      types: [
        KEY_VAULT_SERVICE_ENTITY_TYPE,
        ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
      ],
      dependsOn: [AD_FETCH_ACCOUNT],
      executionHandler: executionHandlerWithAzureContext(fetchKeyVaults),
    },
  ],
};

type IntegrationHandlerFunc = (
  executionContext: IntegrationStepContext,
) => Promise<void>;

// TODO Create a single instance for use across steps, depends on https://github.com/JupiterOne/integration-sdk/issues/163
function executionHandlerWithAzureContext(
  handlerFunc: IntegrationHandlerFunc,
): StepExecutionHandlerFunction<IntegrationConfig> {
  return async (
    executionContext: IntegrationStepExecutionContext<IntegrationConfig>,
  ): Promise<void> => {
    await handlerFunc(createIntegrationStepContext(executionContext));
  };
}

function createIntegrationStepContext(
  executionContext: IntegrationStepExecutionContext<IntegrationConfig>,
): IntegrationStepContext {
  const { logger, instance } = executionContext;
  const graphClient = createGraphClient(logger, instance.config);

  return {
    ...executionContext,
    graphClient,
  };
}
