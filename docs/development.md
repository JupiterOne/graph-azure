# Azure Integration Development

There are a few steps to take to setup Azure integration development:

1. Identify an Azure account for local development. It is highly recommended
   that you avoid targeting a production Active Directory or Subscription,
   because tests rely on Polly.js recordings for playback in CI/CD environments.
   JupiterOne staff developers each have their own Azure Subscription.
1. Create credentials with write permissions to configure
   `<graph-azure>/terraform/.env`. The Terraform Azure provider client needs a
   lot more permissions than the integration itself
1. Create an App Registration with read permissions to configure
   `<graph-azure>/.env`. The integration Azure client will use this for
   ingesting information about the targeted Active Directory and Azure
   Subscription.

## Prerequisites

### Azure Account and Subscription

You need an Azure account, and within the account you will need an Azure
Subscription for IaaS resources for development.

If you already have a Microsoft account, you can use that email address to get
started with Azure, though you should be careful to avoid using the default
Active Directory or any production Active Directory or Azure Subscription.
Alternatively, consider creating a free Microsoft Hotmail email address and
create a completely independent account to get started. In any case, be aware
that you will likely run into charges at some point, so be sure you know how
things will be paid for, whether by expensing your company or sticking with
their existing account, having an administrator give you a development Active
Directory and Subscription with billing that rolls up to the company.

### Azure Setup for Terraform

Once you have an Azure account and Subscription, you'll need credentials for the
Terraform provider to use that allow for creating and destroying resources. In
Azure API parlance, Terraform is considered a script that needs to authenticate
with the Resource Manager API. Scripts run using Service Principal credentials
instead of User Principal credentials. [Create a Service Principal][2] using the
Azure CLI.

First, install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/) and
login to be sure that works.

On a Mac:

```sh
brew update && brew install azure-cli
az login
```

Now create the Service Principal:

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

Using the Service Principal credentials created above, create
`<graph-azure>/terraform/.env` to establish authentication values for the Azure
Terraform provider. This file is already in `.gitignore`, and is distinct from
the `<graph-azure>/.env` file read by the integration, which will have
different, read-only credentials from the App Registration.

```txt
ARM_CLIENT_ID=service_principal_appId
ARM_CLIENT_SECRET=service_principal_password
ARM_TENANT_ID=development_directory_tenant_id
ARM_SUBSCRIPTION_ID=development_subscription_id

# Not needed for public, required for usgovernment, german, china
ARM_ENVIRONMENT=public

# Used to ensure unique resource IDs in global infrastructure, such as databases
# and containers, which have URLs that are based on those IDs and must remain
# unique across all of Azure.
TF_VAR_developer_id=<your github handle up to 8 chars>
```

You should now be able to [execute Terraform](#executing-terraform) with these
credentials.

### Azure Setup for Integration

The integration is in essence itself just another script. It needs only enough
permissions to read information from the target Active Directory and Azure
Subscription. The Service Principal created for Terraform _must not be used_ as
it will lead to problems in production, where the script will most certainly NOT
have such permissive credentials.

Currently, customers are asked to create an App Registration for JupiterOne in
their own Active Directory. You will
_[take the same steps](jupiterone.md#integration-instance-configuration)_ in
your development Active Directory to create an App Registration, granting it
consent to access certain APIs, and using the App Registration credentials to
execute the integration on your local machine.

Using the Application (client) ID, Directory (tenant) ID, and generated secret
from the App Registration, create `<graph-azure>/.env` to establish
authentication values for the integration API clients. This file is already in
`.gitignore`, and is distinct from the `<graph-azure>/terraform/.env` file read
by Terraform.

```txt
CLIENT_ID=app_registration_client_id
CLIENT_SECRET=app_registration_client_secret
DIRECTORY_ID=development_directory_id
SUBSCRIPTION_ID=development_subscription_id
INGEST_ACTIVE_DIRECTORY=true
```

You should not be able to [execute the integration](#execute-the-integration)
with these credentials. Note that [running the tests](#running-tests) requires
more attention.

## Executing Terraform

Example Azure resources are maintained with Terraform to allow for easy setup
and teardown, and to avoid unnecessary expenses between development cycles. See
Terraform code where `count` is used to force a decision about which resources
to build. Once an integration step has a recording made, those resources can be
set back to count `0`.

Note that Terraform state will be kept on your local development machine, in
`<graph-azure>/terraform/terraform.tfstate`, and `.gitignore` has a `*.tfstate`
entry.

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

You may prefer to use the
[Terraform Docker Container](https://hub.docker.com/r/hashicorp/terraform/) to
run Terraform.

Initialize Terraform:

```sh
docker run --env-file terraform/.env -i -t -v `pwd`/terraform:/azure -w /azure hashicorp/terraform:light init
```

```sh
docker run --env-file terraform/.env -i -t -v `pwd`/terraform:/azure -w /azure hashicorp/terraform:light plan
```

## Execute the Integration

With `<graph-azure>/.env` in place, simpy run `yarn start`!

## Running Tests

Many of the tests are written to make API requests, with requests and responses
recorded by Polly.js to allow for playback in CI/CD environments. An
[integration configuration for testing](../test/integrationInstanceConfig.ts)
works to ensure that there is an appropriate configuration to replay the
recordings.

During development, the API clients will use the `<graph-azure>/.env` file
(thanks to `jest.config.js`), which means the recordings will be bound to the
`DIRECTORY_ID` etc. defined therein. When another developer comes along with
their own Azure setup the request matching will fail.

TODO: Make request matching ignore some deets

[1]: https://docs.microsoft.com/en-us/graph/use-postman?view=graph-rest-1.0
[2]:
  https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?view=azure-cli-latest
