import "cross-fetch/polyfill";

import {
  IntegrationError,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  fetchBatchOfGroupMembers,
  fetchBatchOfGroups,
  fetchBatchOfUsers,
} from "./azure";
import initializeContext from "./initializeContext";
import invocationValidator from "./invocationValidator";
import deleteDeprecatedTypes from "./synchronizers/deleteDeprecatedTypes";
import synchronizeAccount from "./synchronizers/synchronizeAccount";
import synchronizeGroupMembers from "./synchronizers/synchronizeGroupMembers";
import synchronizeGroups from "./synchronizers/synchronizeGroups";
import synchronizeComputeResources from "./synchronizers/syncronizeComputeResources";
import synchronizeUsers from "./synchronizers/syncronizeUsers";
import { AzureIntegrationInstanceConfig } from "./types";

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
  },
  invocationValidator,
  integrationStepPhases: [
    {
      steps: [
        {
          name: "Synchronize Account",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            return synchronizeAccount(initializeContext(executionContext));
          },
        },
      ],
    },
    {
      steps: [
        {
          name: "Fetch Users",
          iterates: true,
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            const iterationState = getIterationState(executionContext);
            return fetchBatchOfUsers(
              initializeContext(executionContext),
              iterationState,
            );
          },
        },
        {
          name: "Fetch Groups",
          iterates: true,
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
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
          name: "Fetch Group Members",
          iterates: true,
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            const iterationState = getIterationState(executionContext);
            return fetchBatchOfGroupMembers(
              initializeContext(executionContext),
              iterationState,
            );
          },
        },
        {
          name: "Synchronize Users",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            return synchronizeUsers(initializeContext(executionContext));
          },
        },
        {
          name: "Synchronize Groups",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            return synchronizeGroups(initializeContext(executionContext));
          },
        },
        {
          name: "Synchronize VMs",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ): Promise<IntegrationExecutionResult> => {
            if (
              (executionContext.instance
                .config as AzureIntegrationInstanceConfig).subscriptionId
            ) {
              return synchronizeComputeResources(
                initializeContext(executionContext),
              );
            } else {
              return Promise.resolve({});
            }
          },
        },
      ],
    },
    {
      steps: [
        {
          name: "Synchronize Group Members",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            return synchronizeGroupMembers(initializeContext(executionContext));
          },
        },
        {
          name: "Cleanup",
          executionHandler: async (
            executionContext: IntegrationStepExecutionContext,
          ) => {
            return deleteDeprecatedTypes(initializeContext(executionContext));
          },
        },
      ],
    },
  ],
};

function getIterationState(executionContext: IntegrationStepExecutionContext) {
  const iterationState = executionContext.event.iterationState;
  if (!iterationState) {
    throw new IntegrationError("Expected iterationState not found in event!");
  }
  return iterationState;
}
