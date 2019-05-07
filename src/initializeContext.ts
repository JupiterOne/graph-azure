import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import AzureClient from "./azure/AzureClient";
import { AzureExecutionContext } from "./types";

export default async function initializeContext(
  context: IntegrationExecutionContext,
): Promise<AzureExecutionContext> {
  const {
    instance: { config },
  } = context;

  const azure = new AzureClient(
    config.clientId,
    config.clientSecret,
    config.directoryId,
  );
  await azure.authenticate();

  return {
    ...context,
    ...context.clients.getClients(),
    azure,
  };
}
