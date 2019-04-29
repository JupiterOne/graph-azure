import {
  IntegrationActionName,
  IntegrationExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import fetchAzureData from "./azure/fetchAzureData";
import initializeContext from "./initializeContext";
import fetchEntitiesAndRelationships from "./jupiterone/fetchEntitiesAndRelationships";
import publishChanges from "./persister/publishChanges";
import { AzureExecutionContext } from "./types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const actionFunction = ACTIONS[context.event.action.name];
  if (actionFunction) {
    return await actionFunction(await initializeContext(context));
  } else {
    return {};
  }
}

async function synchronize(
  context: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { instance, graph, persister, azure } = context;

  const oldData = await fetchEntitiesAndRelationships(graph);
  const azureData = await fetchAzureData(azure);

  return {
    operations: await publishChanges(persister, oldData, azureData, instance),
  };
}

type ActionFunction = (
  context: AzureExecutionContext,
) => Promise<IntegrationExecutionResult>;

interface ActionMap {
  [actionName: string]: ActionFunction | undefined;
}

const ACTIONS: ActionMap = {
  [IntegrationActionName.INGEST]: synchronize,
};
