import {
  Recording,
  executeStepWithDependencies,
} from '@jupiterone/integration-sdk-testing';
import { getStepTestConfigForStep } from '../../../../../test/integrationInstanceConfig';
import {
  setupAzureRecording,
  getMatchRequestsBy,
} from '../../../../../test/helpers/recording';
import {
  STEP_RM_DATABASE_MYSQL_DATABASES,
  STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
} from '../constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});
test(
  STEP_RM_DATABASE_MYSQL_DATABASES,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_DATABASE_MYSQL_DATABASES,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_DATABASE_MYSQL_DATABASES,
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
  STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
  async () => {
    const stepTestConfig = getStepTestConfigForStep(
      STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
    );

    recording = setupAzureRecording(
      {
        name: STEP_RM_DATABASE_MYSQL_DATABASES_DIAGNOSTIC_SETTINGS,
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
