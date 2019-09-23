import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import { AzureClient } from "./azure";
import { AzureExecutionContext } from "./types";

export default function initializeContext(
  context: IntegrationExecutionContext,
): AzureExecutionContext {
  const {
    instance: { config },
    logger,
  } = context;

  const azure = new AzureClient(
    config.clientId,
    config.clientSecret,
    config.directoryId,
    logger,
  );

  return {
    ...context,
    ...context.clients.getClients(),
    azure,
  };
}
