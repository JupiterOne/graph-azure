# RBAC and Director Admin Roles

**[Backround](https://docs.microsoft.com/en-us/azure/role-based-access-control/rbac-and-directory-admin-roles)**

[Azure role-based access control (RBAC)](https://docs.microsoft.com/en-us/azure/role-based-access-control/overview)
is the authorization system you use to manage access to Azure resources. To
grant access, you assign roles to users, groups, service principals, or managed
identities at a particular scope. RBAC is an additive model, so your effective
permissions are the sum of your role assignments. Deny assignments take
precedence over role assignments. See the Portal "Access control (IAM)" blade in
a selected Subscription. Role information can be accessed in Azure portal, Azure
CLI, Azure PowerShell, Azure Resource Manager templates, REST API

Only the Azure portal and the Azure Resource Manager APIs support RBAC. Users,
groups, and applications that are assigned RBAC roles cannot use the
[Azure classic deployment model APIs](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/deployment-models).

If you need to assign administrator roles in Microsoft Entra ID, see View and
assign administrator roles in Microsoft Entra ID. Microsoft Entra administrator
roles are used to manage Microsoft Entra resources in a directory such as create
or edit users, assign administrative roles to others, reset user passwords,
manage user licenses, and manage domains. See the Portal "Roles and
administrators" blade in a selected Directory. Role information can be accessed
in Azure admin portal, Microsoft 365 admin center, Microsoft Graph, Microsoft
Entra PowerShell.

By default, Azure RBAC roles and Microsoft Entra administrator roles do not span
Azure and Microsoft Entra. However, if a Global Administrator elevates their
access by choosing the Global admin can manage Azure Subscriptions and
Management Groups switch in the Azure portal, the Global Administrator will be
granted the User Access Administrator role (an RBAC role) on all subscriptions
for a particular tenant. The User Access Administrator role enables the user to
grant other users access to Azure resources. This switch can be helpful to
regain access to a subscription. For more information, see Elevate access as an
Microsoft Entra administrator.

---

A role assignment consists of three elements: security principal, role
definition, and scope.

A
[role definition](https://docs.microsoft.com/en-us/azure/role-based-access-control/role-definitions)
is a collection of permissions. It's typically just called a role. A role
definition lists the operations that can be performed, such as read, write, and
delete. Roles can be high-level, like owner, or specific, like virtual machine
reader.

Azure includes several built-in roles that you can use. **Custom roles** require
an Microsoft Entra Premium P1 or P2.

The following lists four fundamental built-in roles. The first three apply to
all resource types.

Owner - Has full access to all resources including the right to delegate access
to others. Contributor - Can create and manage all types of Azure resources but
can't grant access to others. Reader - Can view existing Azure resources. User
Access Administrator - Lets you manage user access to Azure resources.

You can also assign roles to users in other tenants. You can assign a role to a
group, all users within that group have that role.

AWS has no Group ASSIGNED Role

Group - ASSIGNED -> Policy (in AWS) Role - ASSIGNED -> Policy (in AWS)

---

When was the last login of the Account Administrator (there is only 1 of these
per Azure Account)? When was the last login of the Service Administrator (there
is only 1 of these per Azure Subscription)? When was the last login of the
Co-Administrator (there can be 200 of these per Azure Subscription)?

Are there any Classic administrator assignments in my Azure subscriptions?

- "Classic administrators are only needed if you are still using Azure classic
  deployments. We recommend using role assignments for all other purposes."
- Currently getting an error on the page listing classic admins...

What users are assigned roles in tenants outside my organization?

- "my organization" is tenants we're ingesting
- Can we know which tenants belong to my organization without having them
  configured as integration instances?

What resource groups are allowed write access to critical data stores?

Who are assigned administrative roles in my production Azure accounts?

Who has been assigned full Administrator access?

- Owner role assignemnt
- The Service Administrator and the Co-Administrators (Classic subscription and
  administrator roles) have the equivalent access of users who have been
  assigned the Owner role (an Azure RBAC role) at the subscription scope.
- Could groups have this role?

Can any Global Administrators manage access to all Azure subscriptions and
management groups in any directory?

- This is considered a safety net means of getting control over IAM (Azure RBAC)
  as a Global Admin in the Microsoft Entra ID associated with an Azure Account
