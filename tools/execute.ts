/* tslint:disable:no-console */
import {
  executeIntegrationLocal,
  IntegrationInvocationConfig,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { createLogger, TRACE } from "bunyan";
import { executionHandler, invocationValidator } from "../src/index";

async function run(): Promise<void> {
  const logger = createLogger({ name: "local", level: TRACE });

  const integrationConfig = {
    clientId: process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID,
    clientSecret: process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET,
    directoryId: process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRRECTORY_ID,
  };

  const invocationArgs = {};
  const invocationConfig: IntegrationInvocationConfig = {
    invocationValidator,
    executionHandler,
  };

  logger.info(
    await executeIntegrationLocal(
      integrationConfig,
      invocationConfig,
      invocationArgs,
    ),
    "Execution completed successfully!",
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
