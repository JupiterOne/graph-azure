# JupiterOne Managed Integration for Microsoft Azure

## Overview

JupiterOne provides a managed integration for Microsoft Azure. The integration
connects directly to Azure APIs to obtain account metadata and analyze resource
relationships. Customers authorize access by ... and providing that credential
to JupiterOne.

## Integration Instance Configuration

The integration is triggered by an event containing the information for a
specific integration instance.

Example Provider provides [detailed instructions on creating an API token][1]
within your Example Provider account.

## Entities

The following entity resources are ingested when the integration runs:

| Example Entity Resource | \_type : \_class of the Entity        |
| ----------------------- | ------------------------------------- |
| Account                 | `example_account` : `Account`         |
| Application             | `example_application` : `Application` |

## Relationships

The following relationships are created/mapped:

| From              | Type    | To                    |
| ----------------- | ------- | --------------------- |
| `example_account` | **HAS** | `example_application` |

[1]: https://jupiterone.io/
