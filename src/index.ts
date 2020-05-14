import {
  IntegrationExecutionContext,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
  IntegrationStepStartStates,
} from "@jupiterone/integration-sdk";

import { AzureClient } from "./azure";
import {
  ACCOUNT_ENTITY_TYPE,
  GROUP_ENTITY_TYPE,
  USER_ENTITY_TYPE,
} from "./jupiterone";
import fetchAccount from "./steps/fetchAccount";
import fetchUsers from "./steps/fetchUsers";
import { IntegrationConfig, IntegrationStepContext } from "./types";
import validateInvocation from "./validateInvocation";

export const AD_FETCH_GROUPS = "fetch-groups";
export const AD_FETCH_GROUP_MEMBERS = "fetch-group-members";
export const AD_FETCH_USERS = "fetch-users";
export const AD_SYNC_GROUPS = "sync-groups";
export const AD_SYNC_GROUP_MEMBERS = "sync-group-members";
export const AD_SYNC_USERS = "sync-users";

export const CLEANUP = "cleanup";

export const RM_SYNC_COMPUTE = "sync-rm-compute";
export const RM_SYNC_KEYVAULT = "sync-rm-keyvault";
export const RM_SYNC_STORAGE = "sync-rm-storage";
export const RM_SYNC_DATABASES = "sync-rm-databases";
export const RM_SYNC_COSMOSDB = "sync-rm-cosmosdb";

export const invocationConfig: IntegrationInvocationConfig = {
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
    executionContext: IntegrationExecutionContext,
  ): IntegrationStepStartStates => {
    const config = (executionContext.instance.config ||
      {}) as IntegrationConfig;

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
        [AD_SYNC_GROUPS]: activeDirectory,
        [AD_SYNC_GROUP_MEMBERS]: activeDirectory,
        [AD_SYNC_USERS]: activeDirectory,
      };
    }

    if (resourceManager.disabled) {
      states = {
        ...states,
        [RM_SYNC_COMPUTE]: resourceManager,
        [RM_SYNC_KEYVAULT]: resourceManager,
        [RM_SYNC_STORAGE]: resourceManager,
        [RM_SYNC_DATABASES]: resourceManager,
        [RM_SYNC_COSMOSDB]: resourceManager,
      };
    }

    return states;
  },

  integrationSteps: [
    {
      id: "account",
      name: "Synchronize Account",
      types: [ACCOUNT_ENTITY_TYPE],
      executionHandler: executionHandlerWithAzureContext(fetchAccount),
    },
    {
      id: AD_FETCH_USERS,
      name: "Fetch Users",
      types: [USER_ENTITY_TYPE],
      executionHandler: executionHandlerWithAzureContext(fetchUsers),
    },
    {
      id: AD_FETCH_GROUPS,
      name: "Fetch Groups",
      types: [GROUP_ENTITY_TYPE],
      executionHandler: executionHandlerWithAzureContext(fetchGroups),
    },
  ],
};

type IntegrationHandlerFunc = (
  executionContext: IntegrationStepContext,
) => Promise<void>;

function executionHandlerWithAzureContext(
  handlerFunc: IntegrationHandlerFunc,
): Function {
  return async (
    executionContext: IntegrationStepExecutionContext<IntegrationConfig>,
  ): Promise<void> => {
    await handlerFunc(createIntegrationStepContext(executionContext));
  };
}

// TODO need a semaphore on that azureClient
function createIntegrationStepContext(
  executionContext: IntegrationStepExecutionContext<IntegrationConfig>,
): IntegrationStepContext {
  const {
    clientId,
    clientSecret,
    directoryId,
  } = executionContext.instance.config;

  let azureClient: AzureClient;

  return {
    ...executionContext,
    getAzureClient: (): AzureClient => {
      if (!azureClient) {
        azureClient = new AzureClient(
          clientId,
          clientSecret,
          directoryId,
          executionContext.logger,
        );
      }
      return azureClient;
    },
  };
}
