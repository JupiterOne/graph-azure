import { AzureIntegrationInstanceConfig } from "../src/types";

const config: AzureIntegrationInstanceConfig = {
  clientId: process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID || "clientId",
  clientSecret:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET || "clientSecret",
  directoryId:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRECTORY_ID || "directoryId",
  subscriptionId:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_SUBSCRIPTION_ID || "subscriptionId",
};

export default config;
