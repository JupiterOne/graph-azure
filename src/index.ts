import "cross-fetch/polyfill";

import {
  IntegrationError,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
  IntegrationStepIterationState,
  IntegrationStepStartStates,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  fetchBatchOfGroupMembers,
  fetchBatchOfGroups,
  fetchBatchOfUsers,
} from "./azure";
import initializeContext from "./initializeContext";
import invocationValidator from "./invocationValidator";
import synchronizeAccount from "./synchronizers/synchronizeAccount";
import synchronizeGroupMembers from "./synchronizers/synchronizeGroupMembers";
import synchronizeGroups from "./synchronizers/synchronizeGroups";
import synchronizeStorageAccounts from "./synchronizers/synchronizeStorageAccounts";
import synchronizeComputeResources from "./synchronizers/syncronizeComputeResources";
import synchronizeDatabaseResources from "./synchronizers/syncronizeDatabaseResources";
import synchronizeUsers from "./synchronizers/syncronizeUsers";
import { AzureIntegrationInstanceConfig } from "./types";

export const AD_FETCH_GROUPS = "fetch-groups";
export const AD_FETCH_GROUP_MEMBERS = "fetch-group-members";
export const AD_FETCH_USERS = "fetch-users";
export const AD_SYNC_GROUPS = "sync-groups";
export const AD_SYNC_GROUP_MEMBERS = "sync-group-members";
export const AD_SYNC_USERS = "sync-users";

export const CLEANUP = "cleanup";

export const RM_SYNC_COMPUTE = "sync-rm-compute";
export const RM_SYNC_STORAGE = "sync-rm-storage";
export const RM_SYNC_DATABASES = "sync-rm-databases";

export const stepFunctionsInvocationConfig: IntegrationInvocationConfig = {
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

  invocationValidator,

  getStepStartStates: (
    executionContext: IntegrationExecutionContext,
  ): IntegrationStepStartStates => {
    const config = (executionContext.instance.config ||
      {}) as AzureIntegrationInstanceConfig;

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
        [RM_SYNC_STORAGE]: resourceManager,
        [RM_SYNC_DATABASES]: resourceManager,
      };
    }

    return states;
  },

  integrationStepPhases: [
    {
      steps: [
        {
          id: "account",
          name: "Synchronize Account",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeAccount(initializeContext(executionContext));
          },
        },
      ],
    },
    {
      steps: [
        {
          id: AD_FETCH_USERS,
          name: "Fetch Users",
          iterates: true,
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationStepIterationState> => {
            const iterationState = getIterationState(executionContext);
            return fetchBatchOfUsers(
              initializeContext(executionContext),
              iterationState,
            );
          },
        },
        {
          id: AD_FETCH_GROUPS,
          name: "Fetch Groups",
          iterates: true,
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationStepIterationState> => {
            const iterationState = getIterationState(executionContext);
            return fetchBatchOfGroups(
              initializeContext(executionContext),
              iterationState,
            );
          },
        },
      ],
    },
    {
      steps: [
        {
          id: AD_FETCH_GROUP_MEMBERS,
          name: "Fetch Group Members",
          iterates: true,
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationStepIterationState> => {
            const iterationState = getIterationState(executionContext);
            return fetchBatchOfGroupMembers(
              initializeContext(executionContext),
              iterationState,
            );
          },
        },
        {
          id: AD_SYNC_USERS,
          name: "Synchronize Users",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeUsers(initializeContext(executionContext));
          },
        },
        {
          id: AD_SYNC_GROUPS,
          name: "Synchronize Groups",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeGroups(initializeContext(executionContext));
          },
        },
        {
          id: RM_SYNC_COMPUTE,
          name: "Synchronize Compute",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeComputeResources(
              initializeContext(executionContext),
            );
          },
        },
        {
          id: RM_SYNC_STORAGE,
          name: "Synchronize Storage",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeStorageAccounts(
              initializeContext(executionContext),
            );
          },
        },
        {
          id: RM_SYNC_DATABASES,
          name: "Synchronize Databases",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeDatabaseResources(
              initializeContext(executionContext),
            );
          },
        },
      ],
    },
    {
      steps: [
        {
          id: AD_SYNC_GROUP_MEMBERS,
          name: "Synchronize Group Members",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            return synchronizeGroupMembers(initializeContext(executionContext));
          },
        },
      ],
    },
  ],
};

function getIterationState(
  executionContext: IntegrationStepExecutionContext,
): IntegrationStepIterationState {
  const iterationState = executionContext.event.iterationState;
  if (!iterationState) {
    throw new IntegrationError("Expected iterationState not found in event!");
  }
  return iterationState;
}
