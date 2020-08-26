# JupiterOne Managed Integration for Microsoft Azure

## Overview

JupiterOne provides a managed integration for Microsoft Azure. The integration
connects directly to Microsoft 365 and Azure Resource Manager APIs to obtain
metadata and analyze resource relationships. Customers authorize access by
creating a Service Principal (App Registration) and providing the credentials to
JupiterOne.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance. Users configure the integration by providing API
credentials obtained through the Azure portal.

Azure Active Directory is authenticated and accessed through the [Microsoft
Graph API][1]. Azure Resource Manager is authenticated and accessed through
[Resource Manager APIs][2].

To create the App Registration:

1. Go to your Azure portal
1. Navigate to **App registrations**
1. Create a new App registration, using the **Name** "JupiterOne", selecting
   **Accounts in this organizational directory only**, with **no** "Redirect
   URI"
1. Navigate to the **Overview** page of the new app
1. Copy the **Application (client) ID**
1. Copy the **Directory (tenant) ID**
1. Navigate to the **Certificates & secrets** section
1. Create a new client secret
1. Copy the generated secret (you only get one chance!)

Grant permission to read Microsoft Graph information:

1. Navigate to **API permissions**, choose **Microsoft Graph**, then
   **Application Permissions**
1. Grant `Directory.Read.All` permissions to allow reading users, groups, and
   members of groups, including organization contacts and Microsoft Intune
   devices
1. Grant admin consent for this directory for the permissions above

Please note that minimally [`User.Read` is required][3] even when AD ingestion
is disabled. The integration will request Organization information to maintain
the `Account` entity.

Grant the `Reader` RBAC subscription role to read Azure Resource Manager
information:

1. Navigate to **Subscriptions**, choose the subscription from which you want to
   ingest resources
1. Copy the **Subscription ID**
1. Navigate to **Access control (IAM)**, then **Add role assignment**
1. Select **Role** "Reader", **Assign access to** "Azure AD user, group, or
   service principal"
1. Search for the App "JupiterOne"

<!-- {J1_DOCUMENTATION_MARKER_START} -->
<!--
********************************************************************************
NOTE: ALL OF THE FOLLOWING DOCUMENTATION IS GENERATED USING THE
"j1-integration document" COMMAND. DO NOT EDIT BY HAND! PLEASE SEE THE DEVELOPER
DOCUMENTATION FOR USAGE INFORMATION:

https://github.com/JupiterOne/sdk/blob/master/docs/integrations/development.md
********************************************************************************
-->
## Data Model

### Entities

The following entities are created:

| Resources                   | Entity `_type`                | Entity `_class`                 |
| --------------------------- | ----------------------------- | ------------------------------- |
| [AD] Account                | `azure_account`               | `Account`                       |
| [AD] Group                  | `azure_user_group`            | `UserGroup`                     |
| [AD] Group Member           | `azure_group_member`          | `User`                          |
| [RM] Image                  | `azure_image`                 | `Image`                         |
| [RM] MariaDB Server         | `azure_mariadb_server`        | `Database`, `DataStore`, `Host` |
| [RM] MariaDB Database       | `azure_mariadb_database`      | `Database`, `DataStore`         |
| [RM] MySQL Server           | `azure_mysql_server`          | `Database`, `DataStore`, `Host` |
| [RM] MySQL Database         | `azure_mysql_database`        | `Database`, `DataStore`         |
| [RM] PostgreSQL Server      | `azure_postgresql_server`     | `Database`, `DataStore`, `Host` |
| [RM] PostgreSQL Database    | `azure_postgresql_database`   | `Database`, `DataStore`         |
| [RM] SQL Server             | `azure_sql_server`            | `Database`, `DataStore`, `Host` |
| [RM] SQL Database           | `azure_sql_database`          | `Database`, `DataStore`         |
| [RM] Load Balancer          | `azure_lb`                    | `Gateway`                       |
| [RM] Public IP Address      | `azure_public_ip`             | `IpAddress`                     |
| [RM] Network Interface      | `azure_nic`                   | `NetworkInterface`              |
| [RM] Security Group         | `azure_security_group`        | `Firewall`                      |
| [RM] Virtual Network        | `azure_vnet`                  | `Network`                       |
| [RM] Subnet                 | `azure_subnet`                | `Network`                       |
| [RM] Blob Storage Service   | `azure_storage_blob_service`  | `Service`                       |
| [RM] Blob Storage Container | `azure_storage_container`     | `DataStore`                     |
| [RM] File Storage Service   | `azure_storage_file_service`  | `Service`                       |
| [RM] File Storage Share     | `azure_storage_share`         | `DataStore`                     |
| [RM] Azure Managed Disk     | `azure_managed_disk`          | `DataStore`, `Disk`             |
| [RM] Virtual Machine        | `azure_vm`                    | `Host`                          |
| [RM] Role Assignment        | `azure_role_assignment`       | `AccessPolicy`                  |
| [AD] Service Principal      | `azure_service_principal`     | `Service`                       |
| [AD] User                   | `azure_user`                  | `User`                          |
| [RM] Key Vault              | `azure_keyvault_service`      | `Service`                       |
| [RM] Cosmos DB Account      | `azure_cosmosdb_account`      | `Account`, `Service`            |
| [RM] Cosmos DB Database     | `azure_cosmosdb_sql_database` | `Database`, `DataStore`         |
| [RM] Role Definition        | `azure_role_definition`       | `AccessRole`                    |
| [RM] Classic Admin          | `azure_classic_admin_group`   | `UserGroup`                     |

### Relationships

The following relationships are created/mapped:

| Source Entity `_type`        | Relationship `_class` | Target Entity `_type`           |
| ---------------------------- | --------------------- | ------------------------------- |
| `azure_account`              | **HAS**               | `azure_user_group`              |
| `azure_user_group`           | **HAS**               | `azure_user`                    |
| `azure_user_group`           | **HAS**               | `azure_user_group`              |
| `azure_user_group`           | **HAS**               | `azure_group_member`            |
| `azure_mariadb_server`       | **HAS**               | `azure_mariadb_database`        |
| `azure_mysql_server`         | **HAS**               | `azure_mysql_database`          |
| `azure_postgresql_server`    | **HAS**               | `azure_postgresql_database`     |
| `azure_sql_server`           | **HAS**               | `azure_sql_database`            |
| `azure_lb`                   | **CONNECTS**          | `azure_nic`                     |
| `azure_security_group`       | **PROTECTS**          | `azure_nic`                     |
| `azure_vnet`                 | **CONTAINS**          | `azure_subnet`                  |
| `azure_security_group`       | **PROTECTS**          | `azure_subnet`                  |
| `azure_security_group`       | **ALLOWS**            | `azure_subnet`                  |
| `azure_account`              | **HAS**               | `azure_storage_blob_service`    |
| `azure_storage_blob_service` | **HAS**               | `azure_storage_container`       |
| `azure_account`              | **HAS**               | `azure_storage_file_service`    |
| `azure_storage_file_service` | **HAS**               | `azure_storage_share`           |
| `azure_vm`                   | **USES**              | `azure_managed_disk`            |
| `azure_subnet`               | **HAS**               | `azure_vm`                      |
| `azure_vm`                   | **USES**              | `azure_nic`                     |
| `azure_vm`                   | **USES**              | `azure_public_ip`               |
| `azure_account`              | **HAS**               | `azure_user`                    |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_unknown_principal_type`  |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_application`             |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_directory`               |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_directory_role_template` |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_everyone`                |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_foreign_group`           |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_user_group`              |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_msi`                     |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_service_principal`       |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_unknown`                 |
| `azure_role_assignment`      | **ASSIGNED**          | `azure_user`                    |
| `azure_account`              | **HAS**               | `azure_keyvault_service`        |
| `azure_cosmosdb_account`     | **HAS**               | `azure_cosmosdb_sql_database`   |
| `azure_role_assignment`      | **ALLOWS**            | `azure_unknown_resource_type`   |
| `azure_role_assignment`      | **ALLOWS**            | `azure_subscription`            |
| `azure_role_assignment`      | **ALLOWS**            | `azure_resource_group`          |
| `azure_role_assignment`      | **ALLOWS**            | `azure_keyvault_service`        |
| `azure_role_assignment`      | **ALLOWS**            | `azure_nic`                     |
| `azure_role_assignment`      | **ALLOWS**            | `azure_security_group`          |
| `azure_role_assignment`      | **ALLOWS**            | `azure_public_ip`               |
| `azure_role_assignment`      | **ALLOWS**            | `azure_vnet`                    |
| `azure_role_assignment`      | **ALLOWS**            | `azure_cosmosdb_account`        |
| `azure_role_assignment`      | **USES**              | `azure_role_definition`         |
| `azure_classic_admin_group`  | **HAS**               | `azure_user`                    |
<!--
********************************************************************************
END OF GENERATED DOCUMENTATION AFTER BELOW MARKER
********************************************************************************
-->
<!-- {J1_DOCUMENTATION_MARKER_END} -->

[1]: https://docs.microsoft.com/en-us/graph/auth-v2-service
[2]:
  https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-api-authentication
[3]: https://docs.microsoft.com/en-us/graph/api/organization-get
