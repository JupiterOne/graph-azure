# Authentication

Currently, the integration requires an Azure administrator for the target
(ingested) account to create an App Registration and configure it to allow
access to Azure Entra information as well as Azure infrastructure resources.
This may at some point be replaced by an offsite OAuth2 [flow for Microsoft
Graph][2] and a [flow for Azure][1], perhaps as separate JupiterOne
integrations.

To access resources in Microsoft Entra ID (Microsoft Graph) and Azure Resource
Manager using a single Service Principal:

1. Create an App Registration. This acts as the Service Principal.
1. Grant permissions to read Graph data (entra Users, Groups, etc.)
1. Add the App to the Subscription that will be ingested, granting the
   [Reader][3] role, to allow reading Azure resources (networks, VMs, etc.)

[1]:
  https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-api-authentication
[2]: https://docs.microsoft.com/en-us/graph/auth-v2-service
[3]:
  https://docs.microsoft.com/en-us/azure/role-based-access-control/built-in-roles#reader
