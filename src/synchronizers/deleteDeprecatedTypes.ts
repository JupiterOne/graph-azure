import {
  IntegrationExecutionResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { AzureExecutionContext } from "../types";

export default async function deleteDeprecatedTypes(
  context: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister } = context;

  const results = await Promise.all(
    [
      "azure_user_assigned_group",
      "azure_group_has_group",
      "azure_group_has_user",
    ].map(async t => {
      const objects = await graph.findRelationshipsByType(t);
      return persister.publishRelationshipOperations(
        persister.processRelationships(objects, []),
      );
    }),
  );

  return {
    operations: summarizePersisterOperationsResults(...results),
  };
}
