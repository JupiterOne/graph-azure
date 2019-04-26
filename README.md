# JupiterOne Managed Integration Example

[![Build Status](https://travis-ci.org/JupiterOne/managed-integration-example.svg?branch=master)](https://travis-ci.org/JupiterOne/managed-integration-example)

A JupiterOne integration ingests information such as configurations and other
metadata about digital and physical assets belonging to an organization. The
integration is responsible for connecting to data provider APIs and determining
changes to make to the JupiterOne graph database to reflect the current state of
assets. Managed integrations execute within the JupiterOne infrastructure and
are deployed by the JupiterOne engineering team.

## Integration Instance Configuration

JupiterOne accounts may configure a number of instances of an integration, each
containing credentials and other information necessary for the integration to
connect to provider APIs. An integration is triggered by an event containing the
instance configuration. `IntegrationInstance.config` is encrypted at rest and
decrypted before it is delivered to the integration execution handler.

Currently, the integration instance configuration user interface will need code
changes to collect necessary information.

Local execution of the integration is started through `execute.ts`
(`yarn start`), which may be changed to load development credentials into the
`IntegrationInstance.config`. Use environment variables to avoid publishing
sensitive information to GitHub!

## Documentation

Integration projects must provide documentation for docs.jupiterone.io. This
documentation should outline the credentials required by the data provider API
(including specific permissions if the data provider allows scoping of
credentials), which entities are ingested, and what relationships are created.
At build time, this documentation will be placed in a docs folder inside dist so
that it's included in the NPM module.

The documentation should be placed in `docs/jupiterone-io` and named after the
package. For example, an AWS integration with the name "jupiter-integration-aws"
in `package.json` should have its documentation in
`docs/jupiterone-io/jupiter-integration-aws.md`. Any other files in
`docs/jupiterone-io` will not be published. Also note that namespace is ignored,
so "jupiter-integration-aws" and "@jupiterone/jupiter-integration-aws" should
both name their docs file the same.

The first header in the documentation is used as the title of the document in
the table of contents on docs.jupiterone.io, so it should be the name of the
provider (E.G. "AWS").

The documentation is pushed to docs.jupiterone.io every time a new version of
the integration is specified in `package.json`, so make sure it's up to date
every time you release a new version.

## Development Environment

Integrations mutate the graph to reflect configurations and metadata from the
provider. Developing an integration involves:

1.  Establishing a secure connection to a provider API
1.  Fetching provider data and converting it to entities and relationships
1.  Collecting the existing set of entities and relationships already in the
    graph
1.  Performing a diff to determine which entites/relationships to
    create/update/delete
1.  Delivering create/update/delete operations to the persister to update the
    graph

Run the integration to see what happens. You may use use Node to execute
directly on your machine (NVM is recommended).

1.  Install Docker
1.  `yarn install`
1.  `yarn start:graph`
1.  `yarn start`

Activity is logged to the console indicating the operations produced and
processed. View raw data in the graph database using
[Graphexp](https://github.com/bricaud/graphexp).

Execute the integration again to see that there are no change operations
produced.

Restart the graph server to clear the data when you want to run the integration
with no existing data.

```sh
yarn stop:graph && yarn start:graph
```

### Environment Variables

Provider API configuration is specified by users when they install the
integration into their JupiterOne environment. Some integrations may also
require pre-shared secrets, used across all integration installations, which is
to be secured by JupiterOne and provided in the execution context.

Local execution requires the same configuration parameters for a development
provider account. `tools/execute.ts` is the place to provide the parameters. The
execution script must not include any credentials, and it is important to make
it easy for other developers to execute the integration against their own
development provider account.

1. Update `tools/execute.ts` to provide the properties required by the
   `executionHandler` function
1. Create a `.env` file to provide the environment variables transferred into
   the properties

For example, given this execution script:

```typescript
const integrationConfig = {
  apiToken: process.env.MYPROVIDER_LOCAL_EXECUTION_API_TOKEN,
};

const invocationArgs = {
  preSharedPrivateKey: process.env.MYPROVIDER_LOCAL_EXECUTION_PRIVATE_KEY,
};
```

Create a `.env` file (this is `.gitignore`'d):

```sh
MYPROVIDER_LOCAL_EXECUTION_API_TOKEN=abc123
MYPROVIDER_LOCAL_EXECUTION_PRIVATE_KEY='something\nreally\nlong'
```

#### SDK Variables

Environment variables can modify some aspects of the integration SDK behavior.
These may be added to your `.env` with values to overrided the defaults listed
here.

- `GRAPH_DB_ENDPOINT` - `"localhost"`

### Running tests

All tests must be written using Jest. Focus on testing provider API interactions
and conversion from provider data to entities and relationships.

To run tests locally:

```sh
yarn test
```

### Deployment

Managed integrations are deployed into the JupiterOne infrastructure by staff
engineers using internal projects that declare a dependency on the open source
integration NPM package. The package will be published by the JupiterOne team.

```sh
yarn build:publish
```
