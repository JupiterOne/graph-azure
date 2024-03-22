# Azure

## Azure + JupiterOne Integration Benefits

- Visualize Azure cloud resources in the JupiterOne graph.
- Map Azure users to employees in your JupiterOne account.
- Monitor visibility and governance of your Azure cloud environment by
  leveraging hundreds of out of the box queries.
- Monitor compliance against the Azure CIS Benchmarks framework and other
  security benchmarks using the JupiterOne compliance app.
- Monitor Azure vulnerabilities and findings from multiple services within the
  alerts app.
- Monitor changes to your Azure cloud resources using multiple JupiterOne alert
  rule packs specific to Azure.

## How it Works

- JupiterOne periodically fetches users and cloud resources from Azure to update
  the graph.
- Write JupiterOne queries to review and monitor updates to the graph, or
  leverage existing queries.
- Configure alerts to take action when the JupiterOne graph changes, or leverage
  existing alerts.

## Requirements

- JupiterOne requires the API credentials for the Azure endpoint, specifically
  the Directory (tenant) id, the Application (client) id, and the Application
  (client) secret with the correct permissions assigned.
- You must have permission in JupiterOne to install new integrations.

## Support

If you need help with this integration, please contact
[JupiterOne Support](https://support.jupiterone.io). Also, see the
[Troubleshooting section](#troubleshooting) in this article.

## Integration Walkthrough

Customers authorize access by creating a Service Principal (App Registration)
and providing the credentials to JupiterOne.

The integration is triggered by an event containing the information for a
specific integration instance. Users configure the integration by providing API
credentials obtained through the Azure portal.

Azure Active Directory is authenticated and accessed through the [Microsoft
Graph API][1]. Azure Resource Manager is authenticated and accessed through
[Resource Manager APIs][2].

### Azure Application Configuration

To create the App Registration:

1. Navigate to your [Azure portal](https://portal.azure.com).

2. Navigate to **Azure Active Directory**, then **App registrations**

3. Create a new App registration, using the **Name** "{{productName}}",
   selecting **Accounts in this organizational directory only**, with **no**
   "Redirect URI"

4. Navigate to the **Overview** page of the new app

5. Copy the **Application (client) ID**

6. Copy the **Directory (tenant) ID**

7. Navigate to the **Certificates & secrets** section

8. Create a new client secret

9. Save and copy the generated secret **Value** (NOT the **Secret ID**)

#### API Permissions (Azure Active Directory)

Grant permission to read Microsoft Graph information:

1. Navigate to **API permissions**, choose **Microsoft Graph**, then
   **Application Permissions**

2. Grant the following permissions to the application:

   - `Directory.Read.All`
   - `Policy.Read.All`
   - `AuditLog.Read.All`

3. Grant admin consent for this directory for the permissions above

#### IAM Roles (Azure Management Groups / Subscriptions)

Grant the `JupiterOne Reader` RBAC subscription role to read Azure Resource
Manager information:

1. Navigate to the correct scope for your integration.

   - _(RECOMMENDED) If configuring all subscriptions for a tenant:_ navigate to
     **Management Groups**, then to the
     [Tenant Root Group](https://docs.microsoft.com/en-us/azure/governance/management-groups/overview#root-management-group-for-each-directory).
     (NOTE: If it is not possible to select the **Tenant Root Group** first
     navigate to Azure Active Directory -> Properties -> Select **Yes** on
     **Access management for Azure resources**. Check
     [elevating access](https://learn.microsoft.com/en-us/azure/role-based-access-control/elevate-access-global-admin)
     for more information)

     Please also enable the following flags in your integration instance:

     - Ingest Active Directory.
     - Configure Subscription Instances.
       - Auto-Delete Removed Subscriptions.

   - _If configuring a single Azure Subscription:_ navigate to
     **Subscriptions**, choose the subscription from which you want to ingest
     resources.

     If configuring a single subscription please fill the **Subscription ID**
     field in your integration instance. To get the Subscription ID: Navigate to
     **Subscriptions** and Copy the ID of the one to ingest.

2. Create custom role "JupiterOne Reader"

   1. Navigate to **Access control (IAM)** -> **Add** -> **Add custom role**
   2. Complete the name with "JupiterOne Reader"
   3. Navigate to the JSON tab. Then select **Edit** and add the following
      _actions_:

   ```
   "Microsoft.Advisor/recommendations/read",
   "Microsoft.ApiManagement/service/apis/read",
   "Microsoft.ApiManagement/service/read",
   "Microsoft.Authorization/classicAdministrators/read",
   "Microsoft.Authorization/locks/read",
   "Microsoft.Authorization/policyAssignments/read",
   "Microsoft.Authorization/policyDefinitions/read",
   "Microsoft.Authorization/policySetDefinitions/read",
   "Microsoft.Authorization/roleAssignments/read",
   "Microsoft.Authorization/roleDefinitions/read",
   "Microsoft.Batch/batchAccounts/applications/read",
   "Microsoft.Batch/batchAccounts/certificates/read",
   "Microsoft.Batch/batchAccounts/pools/read",
   "Microsoft.Batch/batchAccounts/read",
   "Microsoft.Cache/redis/firewallRules/read",
   "Microsoft.Cache/redis/linkedServers/read",
   "Microsoft.Cache/redis/read",
   "Microsoft.Cdn/profiles/endpoints/read",
   "Microsoft.Cdn/profiles/read",
   "Microsoft.Compute/disks/read",
   "Microsoft.Compute/galleries/images/read",
   "Microsoft.Compute/galleries/images/versions/read",
   "Microsoft.Compute/galleries/read",
   "Microsoft.Compute/images/read",
   "Microsoft.Compute/virtualMachines/extensions/read",
   "Microsoft.Compute/virtualMachines/read",
   "Microsoft.ContainerInstance/containerGroups/read",
   "Microsoft.ContainerRegistry/registries/read",
   "Microsoft.ContainerRegistry/registries/webhooks/read",
   "Microsoft.ContainerService/managedClusters/read",
   "Microsoft.DBforMariaDB/servers/databases/read",
   "Microsoft.DBforMariaDB/servers/read",
   "Microsoft.DBforMySQL/servers/databases/read",
   "Microsoft.DBforMySQL/servers/read",
   "Microsoft.DBforPostgreSQL/servers/databases/read",
   "Microsoft.DBforPostgreSQL/servers/firewallRules/read",
   "Microsoft.DBforPostgreSQL/servers/read",
   "Microsoft.DocumentDB/databaseAccounts/read",
   "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/read",
   "Microsoft.EventGrid/domains/read",
   "Microsoft.EventGrid/domains/topics/eventSubscriptions/read",
   "Microsoft.EventGrid/domains/topics/read",
   "Microsoft.EventGrid/topics/eventSubscriptions/read",
   "Microsoft.EventGrid/topics/read",
   "Microsoft.Insights/ActivityLogAlerts/Read",
   "Microsoft.Insights/DiagnosticSettings/Read",
   "Microsoft.Insights/LogProfiles/Read",
   "Microsoft.KeyVault/vaults/keys/read",
   "Microsoft.KeyVault/vaults/read",
   "Microsoft.KeyVault/vaults/secrets/read",
   "Microsoft.Management/managementGroups/read",
   "Microsoft.Network/azurefirewalls/read",
   "Microsoft.Network/dnszones/read",
   "Microsoft.Network/dnszones/recordsets/read",
   "Microsoft.Network/frontDoors/read",
   "Microsoft.Network/loadBalancers/read",
   "Microsoft.Network/networkInterfaces/read",
   "Microsoft.Network/networkSecurityGroups/read",
   "Microsoft.Network/networkWatchers/flowLogs/read",
   "Microsoft.Network/networkWatchers/read",
   "Microsoft.Network/privateDnsZones/read",
   "Microsoft.Network/privateDnsZones/recordsets/read",
   "Microsoft.Network/privateEndpoints/read",
   "Microsoft.Network/publicIPAddresses/read",
   "Microsoft.Network/virtualNetworks/read",
   "Microsoft.PolicyInsights/policyStates/queryResults/read",
   "Microsoft.Resources/subscriptions/locations/read",
   "Microsoft.Resources/subscriptions/read",
   "Microsoft.Resources/subscriptions/resourceGroups/read",
   "Microsoft.Security/assessments/read",
   "Microsoft.Security/autoProvisioningSettings/read",
   "Microsoft.Security/pricings/read",
   "Microsoft.Security/securityContacts/read",
   "Microsoft.Security/settings/read",
   "Microsoft.ServiceBus/namespaces/queues/read",
   "Microsoft.ServiceBus/namespaces/read",
   "Microsoft.ServiceBus/namespaces/topics/read",
   "Microsoft.ServiceBus/namespaces/topics/subscriptions/read",
   "Microsoft.Sql/servers/administrators/read",
   "Microsoft.Sql/servers/databases/read",
   "Microsoft.Sql/servers/firewallRules/read",
   "Microsoft.Sql/servers/read",
   "Microsoft.Storage/storageAccounts/blobServices/containers/read",
   "Microsoft.Storage/storageAccounts/blobServices/read",
   "Microsoft.Storage/storageAccounts/fileServices/shares/read",
   "Microsoft.Storage/storageAccounts/queueServices/read",
   "Microsoft.Storage/storageAccounts/read",
   "Microsoft.Storage/storageAccounts/tableServices/read",
   "Microsoft.Storage/storageAccounts/tableServices/tables/read",
   "Microsoft.Web/serverfarms/Read",
   "Microsoft.Web/sites/config/list/action",
   "Microsoft.Web/sites/config/Read",
   "Microsoft.Web/sites/Read",
   "Microsoft.KeyVault/vaults/providers/Microsoft.Insights/diagnosticSettings/Read",
   "Microsoft.Management/managementGroups/subscriptions/read"
   ```

   4. Click on **Save** -> **Review + Create** -> **Create**.

3. Assign Roles to "JupiterOne" App
   1. Navigate to **Access control (IAM)** -> **Add** -> **Add role assignment**
   2. Assign the _JupiterOne Reader_ role to the "JupiterOne" member.
      - On the **Role** tab select the "JupiterOne Reader" we just created.
      - Navigate to the **Member** tab. Select the **+ Select Members** and
        search for the "JupiterOne" App, make sure to click it. Press the
        **Select** button.
      - Navigate to the **Review + assing** tab. Click on **Review + assing**.

### Key Vault Access Policy

Listing key vault keys and secrets (`rm-keyvault-keys` and `rm-keyvault-secrets`
steps) require you to grant the following permissions to the J1 security
principal for each key vault in your account. See the Azure documentation for
more information on
[assigning a key vault access policy](https://go.microsoft.com/fwlink/?linkid=2125287).

1. Navigate to _Key Vaults_ and select the one you want to ingest.
2. Click Access policies, and then click **+Create**.

   ![](../../assets/azure-access-policies.png)

3. On the permissions tab, under Key permissions, and Secret permissions, select
   the permissions.

   ![](../../assets/azure-create-policy.png)

- Key Permissions
  - Key Management Operations
    - List
- Secret Permissions
  - Secret Management Operations
    - List

4. On the Principal tab, assign them to the "JupiterOne" app.
5. Navigate to the on **Review + Create** tab -> Click **Create**

## Troubleshooting

#### Authentication

If the Azure integration does not complete, and you encounter a message like
`[validation_failure] Error occurred while validating integration configuration`
in your job log, check the following common configuration errors:

- **Verify the Application (client) ID and Application (client) Secret:** Make
  sure that you've verified the proper value for client ID and client secret.
  The client secret has both a **Value** property and a **Secret ID** property.
  The **Secret ID** is unused - make sure you haven't accidentally used the
  **Secret ID** as the **Client ID**.
- **Verify that you've enabled the proper API permissions:** Make sure the
  required API permissions (described above) are enabled for the application.
- **Verify that the API permissions have been granted as "Application" and not
  "Delegated":** The integration requires API Permissions of type
  **Application**. Permissions of type **Delegated** will cause issues in your
  integration.
- **Verify that your permissions have been "Grant(ed) admin consent for
  Directory":** If you have added API Permissions to the application, but have
  not granted Admin Consent, the permissions are not yet active.

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/main/docs/integrations/development.md
********************************************************************************
-->

## Data Model

### Entities

The following entities are created:

| Resources                                    | Entity `_type`                         | Entity `_class` |
| -------------------------------------------- | -------------------------------------- | --------------- |
| Azure Application Gateway                    | `azure_application_gateway`            | `Network`       |
| [AD] Account                                 | `azure_account`                        | `Account`       |
| [AD] Device                                  | `azure_device`                         | `Device`        |
| [AD] Group                                   | `azure_user_group`                     | `UserGroup`     |
| [AD] Group Member                            | `azure_group_member`                   | `User`          |
| [AD] Role Definition                         | `azure_ad_role_definition`             | `AccessRole`    |
| [AD] Service Principal                       | `azure_service_principal`              | `Service`       |
| [AD] User                                    | `azure_user`                           | `User`          |
| [RM Azure Express Route Circuit              | `azure_expressroute_circuit`           | `Network`       |
| [RM] Azure Bgp Service Communities           | `azure_bgp_service_communities`        | `Network`       |
| [RM] Azure Express Route                     | `azure_expressroute`                   | `Service`       |
| [RM] Azure Express Route Circuit Connections | `azure_expressroute_circut_connection` | `Network`       |
| [RM] Key Vault                               | `azure_keyvault_service`               | `Service`       |
| [RM] Key Vault Secret                        | `azure_keyvault_secret`                | `Secret`        |
| [RM] Monitor Diagnostic Settings Resource    | `azure_diagnostic_setting`             | `Configuration` |
| [RM] Resource Group                          | `azure_resource_group`                 | `Group`         |
| [RM] Resource Lock                           | `azure_resource_lock`                  | `Rule`          |
| [RM] Storage Account                         | `azure_storage_account`                | `Service`       |
| [RM] Subscription                            | `azure_subscription`                   | `Account`       |
| [RM] Usage Details                           | `azure_usage_details`                  | `Site`          |

### Relationships

The following relationships are created:

| Source Entity `_type`           | Relationship `_class` | Target Entity `_type`                       |
| ------------------------------- | --------------------- | ------------------------------------------- |
| `ANY_SCOPE`                     | **HAS**               | `azure_diagnostic_setting`                  |
| `azure_account`                 | **HAS**               | `azure_keyvault_service`                    |
| `azure_account`                 | **HAS**               | `azure_user`                                |
| `azure_account`                 | **HAS**               | `azure_user_group`                          |
| `azure_bgp_service_communities` | **HAS**               | `azure_expressroute`                        |
| `azure_diagnostic_setting`      | **USES**              | `azure_storage_account`                     |
| `azure_expressroute`            | **HAS**               | `azure_application_gateway`                 |
| `azure_expressroute`            | **HAS**               | `azure_expressroute`                        |
| `azure_expressroute`            | **HAS**               | `azure_expressroute_circut_connection`      |
| `azure_expressroute`            | **HAS**               | `azure_expressroute_cross_connection`       |
| `azure_expressroute`            | **HAS**               | `azure_peer_expressroute_circut_connection` |
| `azure_keyvault_service`        | **CONTAINS**          | `azure_keyvault_secret`                     |
| `azure_resource_group`          | **HAS**               | `azure_keyvault_service`                    |
| `azure_resource_group`          | **HAS**               | `azure_storage_account`                     |
| `azure_resource_lock`           | **HAS**               | `ANY_SCOPE`                                 |
| `azure_service_principal`       | **HAS**               | `ad-role-definitions`                       |
| `azure_storage_account`         | **USES**              | `azure_keyvault_service`                    |
| `azure_subscription`            | **HAS**               | `azure_expressroute`                        |
| `azure_subscription`            | **HAS**               | `azure_resource_group`                      |
| `azure_subscription`            | **HAS**               | `azure_usage_details`                       |
| `azure_user`                    | **HAS**               | `ad-role-definitions`                       |
| `azure_user`                    | **HAS**               | `azure_device`                              |
| `azure_user_group`              | **HAS**               | `azure_group_member`                        |
| `azure_user_group`              | **HAS**               | `azure_user`                                |
| `azure_user_group`              | **HAS**               | `azure_user_group`                          |

### Mapped Relationships

The following mapped relationships are created:

| Source Entity `_type` | Relationship `_class` | Target Entity `_type` | Direction |
| --------------------- | --------------------- | --------------------- | --------- |
| `azure_subscription`  | **USES**              | `*azure_location*`    | FORWARD   |

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->

<!-- {J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-azure-integration document-diagnostic-settings" COMMAND. DO NOT EDIT BY HAND!
********************************************************************************
-->

## Diagnostic Settings

Azure Diagnostic Settings are supported on many Azure resources. A list of
supported services / metrics can be found in
[Azure documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/essentials/metrics-supported).

The JupiterOne graph-azure project currently ingests diagnostic settings for the
following entities:

- azure_api_management_service
- azure_batch_account
- azure_cdn_endpoint
- azure_cdn_profile
- azure_container_registry
- azure_event_grid_domain
- azure_event_grid_topic
- azure_keyvault_service
  - Log Categories:
    - AuditEvent
- azure_lb
- azure_mariadb_server
- azure_mysql_server
- azure_network_firewall
- azure_postgresql_server
- azure_public_ip
- azure_security_group
- azure_sql_server
- azure_subscription
  - Log Categories:
    - Administrative
    - Alert
    - Policy
    - Security
- azure_vnet

<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_DIAGNOSTIC_SETTINGS_MARKER_END} -->

[1]: https://docs.microsoft.com/en-us/graph/auth-v2-service
[2]:
  https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-api-authentication
[3]: https://docs.microsoft.com/en-us/graph/api/organization-get

<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_START} -->
<!-- {J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_START} -->

| Role Permissions List (101)                                            |
| ---------------------------------------------------------------------- |
| `Microsoft.Advisor/recommendations/read`                               |
| `Microsoft.ApiManagement/service/apis/read`                            |
| `Microsoft.ApiManagement/service/read`                                 |
| `Microsoft.Authorization/classicAdministrators/read`                   |
| `Microsoft.Authorization/locks/read`                                   |
| `Microsoft.Authorization/policyAssignments/read`                       |
| `Microsoft.Authorization/policyDefinitions/read`                       |
| `Microsoft.Authorization/policySetDefinitions/read`                    |
| `Microsoft.Authorization/roleAssignments/read`                         |
| `Microsoft.Authorization/roleDefinitions/read`                         |
| `Microsoft.Batch/batchAccounts/applications/read`                      |
| `Microsoft.Batch/batchAccounts/certificates/read`                      |
| `Microsoft.Batch/batchAccounts/pools/read`                             |
| `Microsoft.Batch/batchAccounts/read`                                   |
| `Microsoft.Cache/redis/firewallRules/read`                             |
| `Microsoft.Cache/redis/linkedServers/read`                             |
| `Microsoft.Cache/redis/read`                                           |
| `Microsoft.Cdn/profiles/endpoints/read`                                |
| `Microsoft.Cdn/profiles/read`                                          |
| `Microsoft.Compute/disks/read`                                         |
| `Microsoft.Compute/galleries/images/read`                              |
| `Microsoft.Compute/galleries/images/versions/read`                     |
| `Microsoft.Compute/galleries/read`                                     |
| `Microsoft.Compute/images/read`                                        |
| `Microsoft.Compute/virtualMachines/extensions/read`                    |
| `Microsoft.Compute/virtualMachines/read`                               |
| `Microsoft.Compute/virtualMachineScaleSets/read`                       |
| `Microsoft.Consumption/usageDetails/read`                              |
| `Microsoft.ContainerInstance/containerGroups/read`                     |
| `Microsoft.ContainerRegistry/registries/read`                          |
| `Microsoft.ContainerRegistry/registries/webhooks/read`                 |
| `Microsoft.ContainerService/managedClusters/read`                      |
| `Microsoft.DBforMariaDB/servers/databases/read`                        |
| `Microsoft.DBforMariaDB/servers/read`                                  |
| `Microsoft.DBforMySQL/servers/databases/read`                          |
| `Microsoft.DBforMySQL/servers/read`                                    |
| `Microsoft.DBforPostgreSQL/servers/databases/read`                     |
| `Microsoft.DBforPostgreSQL/servers/firewallRules/read`                 |
| `Microsoft.DBforPostgreSQL/servers/read`                               |
| `Microsoft.DocumentDB/databaseAccounts/read`                           |
| `Microsoft.DocumentDB/databaseAccounts/sqlDatabases/read`              |
| `Microsoft.EventGrid/domains/read`                                     |
| `Microsoft.EventGrid/domains/topics/eventSubscriptions/read`           |
| `Microsoft.EventGrid/domains/topics/read`                              |
| `Microsoft.EventGrid/topics/eventSubscriptions/read`                   |
| `Microsoft.EventGrid/topics/read`                                      |
| `Microsoft.Insights/ActivityLogAlerts/Read`                            |
| `Microsoft.Insights/DiagnosticSettings/Read`                           |
| `Microsoft.Insights/LogProfiles/Read`                                  |
| `Microsoft.KeyVault/vaults/keys/read`                                  |
| `Microsoft.KeyVault/vaults/read`                                       |
| `Microsoft.KeyVault/vaults/secrets/read`                               |
| `Microsoft.Management/managementGroups/read`                           |
| `Microsoft.Network/azurefirewalls/read`                                |
| `Microsoft.Network/dnszones/read`                                      |
| `Microsoft.Network/dnszones/recordsets/read`                           |
| `Microsoft.Network/firewallPolicies/Read`                              |
| `Microsoft.Network/firewallPolicies/ruleCollectionGroups/Read`         |
| `Microsoft.Network/frontDoors/read`                                    |
| `Microsoft.Network/loadBalancers/read`                                 |
| `Microsoft.Network/networkInterfaces/read`                             |
| `Microsoft.Network/networkSecurityGroups/read`                         |
| `Microsoft.Network/networkWatchers/flowLogs/read`                      |
| `Microsoft.Network/networkWatchers/read`                               |
| `Microsoft.Network/privateDnsZones/read`                               |
| `Microsoft.Network/privateDnsZones/recordsets/read`                    |
| `Microsoft.Network/privateEndpoints/read`                              |
| `Microsoft.Network/publicIPAddresses/read`                             |
| `Microsoft.Network/virtualNetworks/read`                               |
| `Microsoft.PolicyInsights/policyStates/queryResults/read`              |
| `Microsoft.Resources/subscriptions/locations/read`                     |
| `Microsoft.Resources/subscriptions/read`                               |
| `Microsoft.Resources/subscriptions/resourceGroups/read`                |
| `Microsoft.Security/assessments/read`                                  |
| `Microsoft.Security/autoProvisioningSettings/read`                     |
| `Microsoft.Security/pricings/read`                                     |
| `Microsoft.Security/securityContacts/read`                             |
| `Microsoft.Security/settings/read`                                     |
| `Microsoft.ServiceBus/namespaces/queues/read`                          |
| `Microsoft.ServiceBus/namespaces/read`                                 |
| `Microsoft.ServiceBus/namespaces/topics/read`                          |
| `Microsoft.ServiceBus/namespaces/topics/subscriptions/read`            |
| `Microsoft.Sql/servers/administrators/read`                            |
| `Microsoft.Sql/servers/databases/read`                                 |
| `Microsoft.Sql/servers/firewallRules/read`                             |
| `Microsoft.Sql/servers/read`                                           |
| `Microsoft.Storage/storageAccounts/blobServices/containers/read`       |
| `Microsoft.Storage/storageAccounts/blobServices/read`                  |
| `Microsoft.Storage/storageAccounts/fileServices/shares/read`           |
| `Microsoft.Storage/storageAccounts/queueServices/read`                 |
| `Microsoft.Storage/storageAccounts/read`                               |
| `Microsoft.Storage/storageAccounts/tableServices/read`                 |
| `Microsoft.Storage/storageAccounts/tableServices/tables/read`          |
| `Microsoft.Synapse/workspaces/keys/read`                               |
| `Microsoft.Synapse/workspaces/read`                                    |
| `Microsoft.Synapse/workspaces/sqlPools/dataMaskingPolicies/read`       |
| `Microsoft.Synapse/workspaces/sqlPools/dataMaskingPolicies/rules/read` |
| `Microsoft.Web/serverfarms/Read`                                       |
| `Microsoft.Web/sites/config/list/action`                               |
| `Microsoft.Web/sites/config/Read`                                      |
| `Microsoft.Web/sites/Read`                                             |
| `Microsoft.Advisor/recommendations/read`                               |
| `Microsoft.ApiManagement/service/apis/read`                            |
| `Microsoft.ApiManagement/service/read`                                 |
| `Microsoft.Authorization/classicAdministrators/read`                   |
| `Microsoft.Authorization/locks/read`                                   |
| `Microsoft.Authorization/policyAssignments/read`                       |
| `Microsoft.Authorization/policyDefinitions/read`                       |
| `Microsoft.Authorization/policySetDefinitions/read`                    |
| `Microsoft.Authorization/roleAssignments/read`                         |
| `Microsoft.Authorization/roleDefinitions/read`                         |
| `Microsoft.Batch/batchAccounts/applications/read`                      |
| `Microsoft.Batch/batchAccounts/certificates/read`                      |
| `Microsoft.Batch/batchAccounts/pools/read`                             |
| `Microsoft.Batch/batchAccounts/read`                                   |
| `Microsoft.Cache/redis/firewallRules/read`                             |
| `Microsoft.Cache/redis/linkedServers/read`                             |
| `Microsoft.Cache/redis/read`                                           |
| `Microsoft.Cdn/profiles/endpoints/read`                                |
| `Microsoft.Cdn/profiles/read`                                          |
| `Microsoft.Compute/disks/read`                                         |
| `Microsoft.Compute/galleries/images/read`                              |
| `Microsoft.Compute/galleries/images/versions/read`                     |
| `Microsoft.Compute/galleries/read`                                     |
| `Microsoft.Compute/images/read`                                        |
| `Microsoft.Compute/virtualMachines/extensions/read`                    |
| `Microsoft.Compute/virtualMachines/read`                               |
| `Microsoft.Compute/virtualMachineScaleSets/read`                       |
| `Microsoft.Consumption/usageDetails/read`                              |
| `Microsoft.ContainerInstance/containerGroups/read`                     |
| `Microsoft.ContainerRegistry/registries/read`                          |
| `Microsoft.ContainerRegistry/registries/webhooks/read`                 |
| `Microsoft.ContainerService/managedClusters/read`                      |
| `Microsoft.DBforMariaDB/servers/databases/read`                        |
| `Microsoft.DBforMariaDB/servers/read`                                  |
| `Microsoft.DBforMySQL/servers/databases/read`                          |
| `Microsoft.DBforMySQL/servers/read`                                    |
| `Microsoft.DBforPostgreSQL/servers/databases/read`                     |
| `Microsoft.DBforPostgreSQL/servers/firewallRules/read`                 |
| `Microsoft.DBforPostgreSQL/servers/read`                               |
| `Microsoft.DocumentDB/databaseAccounts/read`                           |
| `Microsoft.DocumentDB/databaseAccounts/sqlDatabases/read`              |
| `Microsoft.EventGrid/domains/read`                                     |
| `Microsoft.EventGrid/domains/topics/eventSubscriptions/read`           |
| `Microsoft.EventGrid/domains/topics/read`                              |
| `Microsoft.EventGrid/topics/eventSubscriptions/read`                   |
| `Microsoft.EventGrid/topics/read`                                      |
| `Microsoft.Insights/ActivityLogAlerts/Read`                            |
| `Microsoft.Insights/DiagnosticSettings/Read`                           |
| `Microsoft.Insights/LogProfiles/Read`                                  |
| `Microsoft.KeyVault/vaults/keys/read`                                  |
| `Microsoft.KeyVault/vaults/read`                                       |
| `Microsoft.KeyVault/vaults/secrets/read`                               |
| `Microsoft.Management/managementGroups/read`                           |
| `Microsoft.Network/azurefirewalls/read`                                |
| `Microsoft.Network/ddosProtectionPlans/read`                           |
| `Microsoft.Network/dnszones/read`                                      |
| `Microsoft.Network/dnszones/recordsets/read`                           |
| `Microsoft.Network/firewallPolicies/Read`                              |
| `Microsoft.Network/firewallPolicies/ruleCollectionGroups/Read`         |
| `Microsoft.Network/frontDoors/read`                                    |
| `Microsoft.Network/loadBalancers/read`                                 |
| `Microsoft.Network/networkInterfaces/read`                             |
| `Microsoft.Network/networkSecurityGroups/read`                         |
| `Microsoft.Network/networkWatchers/flowLogs/read`                      |
| `Microsoft.Network/networkWatchers/read`                               |
| `Microsoft.Network/privateDnsZones/read`                               |
| `Microsoft.Network/privateDnsZones/recordsets/read`                    |
| `Microsoft.Network/privateEndpoints/read`                              |
| `Microsoft.Network/publicIPAddresses/read`                             |
| `Microsoft.Network/virtualNetworks/read`                               |
| `Microsoft.PolicyInsights/policyStates/queryResults/read`              |
| `Microsoft.Resources/subscriptions/locations/read`                     |
| `Microsoft.Resources/subscriptions/read`                               |
| `Microsoft.Resources/subscriptions/resourceGroups/read`                |
| `Microsoft.Security/assessments/read`                                  |
| `Microsoft.Security/autoProvisioningSettings/read`                     |
| `Microsoft.Security/pricings/read`                                     |
| `Microsoft.Security/securityContacts/read`                             |
| `Microsoft.Security/settings/read`                                     |
| `Microsoft.ServiceBus/namespaces/queues/read`                          |
| `Microsoft.ServiceBus/namespaces/read`                                 |
| `Microsoft.ServiceBus/namespaces/topics/read`                          |
| `Microsoft.ServiceBus/namespaces/topics/subscriptions/read`            |
| `Microsoft.Sql/servers/administrators/read`                            |
| `Microsoft.Sql/servers/databases/read`                                 |
| `Microsoft.Sql/servers/firewallRules/read`                             |
| `Microsoft.Sql/servers/read`                                           |
| `Microsoft.Storage/storageAccounts/blobServices/containers/read`       |
| `Microsoft.Storage/storageAccounts/blobServices/read`                  |
| `Microsoft.Storage/storageAccounts/fileServices/shares/read`           |
| `Microsoft.Storage/storageAccounts/queueServices/read`                 |
| `Microsoft.Storage/storageAccounts/read`                               |
| `Microsoft.Storage/storageAccounts/tableServices/read`                 |
| `Microsoft.Storage/storageAccounts/tableServices/tables/read`          |
| `Microsoft.Web/serverfarms/Read`                                       |
| `Microsoft.Web/sites/config/list/action`                               |
| `Microsoft.Web/sites/config/Read`                                      |
| `Microsoft.Web/sites/Read`                                             |

<!-- {J1_PERMISSIONS_DOCUMENTATION_ROLE_PERMISSIONS_END} -->
<!-- {J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_START} -->

| API Permissions List (4) |
| ------------------------ |
| `AuditLog.Read.All`      |
| `Device.Read.All`        |
| `Directory.Read.All`     |
| `Policy.Read.All`        |

<!-- {J1_PERMISSIONS_DOCUMENTATION_API_PERMISSIONS_END} -->
<!-- {J1_PERMISSIONS_DOCUMENTATION_MARKER_END} -->
