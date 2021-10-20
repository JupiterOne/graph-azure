import { Recording } from '@jupiterone/integration-sdk-testing';
import { fetchClusters } from '.';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import {
  getMatchRequestsBy,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

test(
  'step - container services clusters',
  async () => {
    const instanceConfig = configFromEnv;

    recording = setupAzureRecording({
      directory: __dirname,
      name: 'container-services-step-clusters',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const context = createMockAzureStepExecutionContext({
      instanceConfig,
      entities: [
        {
          _class: ['Account'],
          _type: 'azure_subscription',
          _key: `/subscriptions/${instanceConfig.subscriptionId}`,
        },
      ],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: { defaultDomain: 'www.fake-domain.com' },
      },
    });

    await fetchClusters(context);

    expect(context.jobState.collectedEntities.length).toBeGreaterThan(0);
    expect(context.jobState.collectedEntities).toMatchGraphObjectSchema({
      _class: 'Cluster',
      schema: {
        additionalProperties: false,
        properties: {
          _type: { const: 'azure_kubernetes_cluster' },
          _key: { type: 'string' },
          _class: { type: 'array', items: { const: 'Rule' } },
          id: { type: 'string' },
          name: { type: 'string' },
          displayName: { type: 'string' },
          type: { const: 'Microsoft.ContainerService/managedClusters' },
          webLink: { type: 'string' },
          _rawData: { type: 'array', items: { type: 'object' } },
          skuName: { type: 'string' },
          location: { type: 'string' },
          principalId: { type: 'string' },
          tenantId: { type: 'string' },
          provisioningState: { type: 'string' },
          maxAgentPools: { type: 'number' },
          kubernetesVersion: { type: 'string' },
          dnsPrefix: { type: 'string' },
          fqdn: { type: 'string' },
          nodeResourceGroup: { type: 'string' },
          enableRBAC: { type: 'boolean' },
          enablePodSecurityPolicy: { type: 'boolean' },
          disableLocalAccounts: { type: 'boolean' },
        },
      },
    });
  },
  1000 * 10,
);
