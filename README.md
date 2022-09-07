# graph-azure

[![Build Status](https://github.com/JupiterOne/graph-azure/workflows/Build/badge.svg)](https://github.com/JupiterOne/graph-azure/actions?query=workflow%3ABuild)

Integrations are responsible for connecting to data provider APIs to collect
current state and maintain a graph database representing the entities and
relationships managed by the provider.

## Development Environment

You may use use Node to execute directly on your machine.

Prerequisites:

1.  Install terraform and tfenv (see [Development](/docs/development.md))
1.  Provide credentials in `.env` (see
    [Environment Variable](#environment-variables))

Node:

1.  Install Node (Node Version Manager is recommended)
1.  `yarn install`
1.  `yarn start:containers`
1.  `yarn start`

Activity is logged to the console indicating the operations produced and
processed. View raw data in the graph database using
[Graphexp](https://github.com/bricaud/graphexp).

Execute the integration again to see that there are no change operations
produced.

Restart the graph server to clear the data when you want to run the integration
with no existing data.

```sh
yarn restart:containers
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

### Versioning this project

This project is versioned using [auto](https://intuit.github.io/auto/).

Versioning and publishing to NPM are now handled via adding GitHub labels to
pull requests. The following labels should be used for this process:

- patch
- minor
- major
- release

For each pull request, the degree of change should be registered by applying the
appropriate label of patch, minor, or major. This allows the repository to keep
track of the highest degree of change since the last release. When ready to
publish to NPM, the PR should have both its appropriate patch, minor, or major
label applied as well as a release label. The release label will denote to the
system that we need to publish to NPM and will correctly version based on the
highest degree of change since the last release, package the project, and
publish it to NPM.
