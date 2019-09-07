import {
  IntegrationError,
  IntegrationInvocationConfig,
  IntegrationStepExecutionContext,
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
import synchronizeUsers from "./synchronizers/syncronizeUsers";

export const stepFunctionsInvocationConfig: IntegrationInvocationConfig = {
  instanceConfigFields: {
    clientId: {
      type: "string",
      mask: true,
    },
    clientSecret: {
      type: "string",
      mask: true,
    },
    directoryId: {
      type: "string",
      mask: true,
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
            const iterationState = executionContext.event.iterationState;
            if (!iterationState) {
              throw new IntegrationError(
                "Expected iterationState not found in event!",
              );
            }
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
            const iterationState = executionContext.event.iterationState;
            if (!iterationState) {
              throw new IntegrationError(
                "Expected iterationState not found in event!",
              );
            }
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
            const iterationState = executionContext.event.iterationState;
            if (!iterationState) {
              throw new IntegrationError(
                "Expected iterationState not found in event!",
              );
            }
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
