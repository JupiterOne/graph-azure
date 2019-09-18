import { AzureIntegrationInstanceConfig } from "../src/types";

const config: AzureIntegrationInstanceConfig = {
  clientId: process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_ID || "token",
  clientSecret:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_CLIENT_SECRET || "secret",
  directoryId:
    process.env.AZURE_CLOUD_LOCAL_EXECUTION_DIRECTORY_ID || "directory",
};

export default config;
