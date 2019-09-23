import { ComputeManagementClient } from "@azure/arm-compute";

import { AzureIntegrationInstanceConfig } from "../../types";
import authenticate from "./authenticate";

export default async function createComputeClient(
  config: AzureIntegrationInstanceConfig,
): Promise<ComputeManagementClient> {
  const auth = await authenticate(config);
  return new ComputeManagementClient(auth.credentials, auth.subscriptionId);
}
