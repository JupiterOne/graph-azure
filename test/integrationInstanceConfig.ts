import { AzureIntegrationInstanceConfig } from "../src/types";

const config: AzureIntegrationInstanceConfig = {
  clientId: process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID || "clientId",
  clientSecret:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET || "clientSecret",
  directoryId:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRECTORY_ID ||
    "a76fc728-0cba-45f0-a9eb-d45207e14513",
  subscriptionId:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_SUBSCRIPTION_ID ||
    "dccea45f-7035-4a17-8731-1fd46aaa74a0",
};

export default config;
