# Azure Integration Development

Working with the Microsoft Graph is made easier by setting up the [Postman
collection][1].

Any Azure account may be used for local development, though JupiterOne staff
developers maintain an Azure account for the purpose of developing this
integration. The account has a credit card associated with it, so it must be
considered a secured account to avoid unauthorized resource allocation and
expenses.

The example Azure resources are maintained by Terraform to allow for easy setup
and teardown, for the use of any Azure account, and to avoid unnecessary
expenses between development cycles.

## Prerequisites

On a Mac:

```sh
brew update && brew install azure-cli
az login
docker run -i -t hashicorp/terraform:light --version
```

Recap:

1. Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/) and
   login
1. Ensure the
   [Terraform Docker Container](https://hub.docker.com/r/hashicorp/terraform/)
   works

## Authentication for Terraform

In Azure API parlance, Terraform is considered a script that needs to
authenticate with the Resource Manager API. Scripts run using Service Principal
credentials instead of User Principal credentials. [Create a Service
Principal][2] using the Azure CLI.

```sh
az account list --query "[].{name:name, subscriptionId:id, tenantId:tenantId}"
[
  {
    "name": "Microsoft Azure Standard",
    "subscriptionId": "dccea...",
    "tenantId": "a76f..."
  }
]

az ad sp create-for-rbac --role="Contributor" --scopes="/subscriptions/dccea..."
Creating a role assignment under the scope of "/subscriptions/dccea..."
  Retrying role assignment creation: 1/36
  Retrying role assignment creation: 2/36
  Retrying role assignment creation: 3/36
{
  "appId": "a996...",
  "displayName": "azure-cli-2019-09-13-12-11-32",
  "name": "http://azure-cli-2019-09-13-12-11-32",
  "password": "932f...",
  "tenant": "a76f..."
}
```

Using the service principal credentials created above, create
`<jupiter-integration-azure>/terraform/.env` to establish authentication values
for the Azure Terraform provider. This file is already in `.gitignore`.

```txt
ARM_SUBSCRIPTION_ID=your_subscription_id
ARM_CLIENT_ID=your_appId
ARM_CLIENT_SECRET=your_password
ARM_TENANT_ID=your_tenant_id

# Not needed for public, required for usgovernment, german, china
ARM_ENVIRONMENT=public

# developer_id is used to prefix azure resources that are globally unique.
# requirements:
#  - l/t or equal to 8 characters
#  - ONLY lowercase letters or numbers
TF_VAR_developer_id=ndowmon1
```

## Terraforming for Development

### Using `tfenv` on Mac

```sh
brew install tfenv
cat .terraform-version
tfenv install <version>
cd terraform
env `grep -v '^#' .env` terraform init
env `grep -v '^#' .env` terraform plan
```

### Using Docker

Initialize Terraform:

```sh
docker run --env-file terraform/.env -i -t -v `pwd`/terraform:/azure -w /azure hashicorp/terraform:light init
```

```sh
docker run --env-file terraform/.env -i -t -v `pwd`/terraform:/azure -w /azure hashicorp/terraform:light plan
```

[1]: https://docs.microsoft.com/en-us/graph/use-postman?view=graph-rest-1.0
[2]:
  https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?view=azure-cli-latest
