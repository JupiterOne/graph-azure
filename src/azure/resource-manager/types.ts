import { ServiceClientCredentials } from '@azure/ms-rest-js';

/**
 * Credentials obtained for accessing Azure Resource Manager APIs.
 */
export interface AzureManagementClientCredentials {
  credentials: ServiceClientCredentials;
  subscriptionId: string;
}
