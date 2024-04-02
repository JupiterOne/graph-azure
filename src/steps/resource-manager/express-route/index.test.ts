import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../test/helpers/recording';
import { STEP_AZURE_APPLICATION_GATEWAY, STEP_AZURE_BGP_SERVICE_COMMUNITIES, STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION,  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT, STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION, STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION, STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION, STEP_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION, STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION, STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION, STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION, STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION, STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION, STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION} from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_CIRCUIT);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_CIRCUIT,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_PEER_EXPRESS_ROUTE_CONNECTION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_BGP_SERVICE_COMMUNITIES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_BGP_SERVICE_COMMUNITIES);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_BGP_SERVICE_COMMUNITIES,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_CIRCUIT_HAS_AZURE_EXPRESS_ROUTE_CIRCUIT_CONNECTION_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_PEER_EXPRESS_ROUTE_CONNECTION_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_BGP_SERVICE_COMMUNITIES_HAS_AZURE_EXPRESS_ROUTE_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_APPLICATION_GATEWAY,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_APPLICATION_GATEWAY);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_APPLICATION_GATEWAY,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

test(
  STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION);

    recording = setupAzureRecording(
      {
        name: STEP_AZURE_SUBSCRIPTION_HAS_AZURE_BGP_SERVICE_COMMUNITIES_RELATION,
        directory: __dirname,
        options: {
          matchRequestsBy: getMatchRequestsBy({
            config: stepTestConfig.instanceConfig,
          }),
        },
      },
      stepTestConfig.instanceConfig,
    );

    const stepResults = await executeStepWithDependencies(stepTestConfig);
    expect(stepResults).toMatchStepMetadata(stepTestConfig);
  },
  100_000,
);

// test(
//   STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION,
//   async () => {
//     const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION);

//     recording = setupAzureRecording(
//       {
//         name: STEP_AZURE_EXPRESS_ROUTE_HAS_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION_RELATION,
//         directory: __dirname,
//         options: {
//           matchRequestsBy: getMatchRequestsBy({
//             config: stepTestConfig.instanceConfig,
//           }),
//         },
//       },
//       stepTestConfig.instanceConfig,
//     );

//     const stepResults = await executeStepWithDependencies(stepTestConfig);
//     expect(stepResults).toMatchStepMetadata(stepTestConfig);
//   },
//   100_000,
// );

// test.skip(
//   STEP_AZURE_EXPRESS_ROUTE,
//   async () => {
//     const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE);

//     recording = setupAzureRecording(
//       {
//         name: STEP_AZURE_EXPRESS_ROUTE,
//         directory: __dirname,
//         options: {
//           matchRequestsBy: getMatchRequestsBy({
//             config: stepTestConfig.instanceConfig,
//           }),
//         },
//       },
//       stepTestConfig.instanceConfig,
//     );

//     const stepResults = await executeStepWithDependencies(stepTestConfig);
//     expect(stepResults).toMatchStepMetadata(stepTestConfig);
//   },
//   100_000,
// );


//test.skip(
//   STEP_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION,
//   async () => {
//     const stepTestConfig = getStepTestConfigForStep(STEP_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION);

//     recording = setupAzureRecording(
//       {
//         name: STEP_AZURE_EXPRESS_ROUTE_CROSS_CONNECTION,
//         directory: __dirname,
//         options: {
//           matchRequestsBy: getMatchRequestsBy({
//             config: stepTestConfig.instanceConfig,
//           }),
//         },
//       },
//       stepTestConfig.instanceConfig,
//     );

//     const stepResults = await executeStepWithDependencies(stepTestConfig);
//     expect(stepResults).toMatchStepMetadata(stepTestConfig);
//   },
//   100_000,
// );
