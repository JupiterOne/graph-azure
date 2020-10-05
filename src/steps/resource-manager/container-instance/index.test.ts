import {
  createMockStepExecutionContext,
  Recording,
  MockIntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../../types';
import { setupAzureRecording } from '../../../../test/helpers/recording';
import { fetchContainerGroups } from '.';

const instanceConfig: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;
let context: MockIntegrationStepExecutionContext<IntegrationConfig>;

describe('step = container instance container groups', () => {
  beforeAll(async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'resource-manager-step-container-groups',
    });

    const entities = {
      '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev': {
        _key:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
        _type: 'azure_resource_group',
        _class: ['Group'],
        name: 'j1dev',
        id:
          '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev',
      },
    };

    context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig,
      entities: Object.values(entities),
    });

    context.jobState.getData = jest.fn().mockResolvedValue({
      defaultDomain: 'www.fake-domain.com',
    });

    await fetchContainerGroups(context);
  });

  afterAll(async () => {
    if (recording) {
      await recording.stop();
    }
  });

  it('should track the Container Group entity', () => {
    expect(context.jobState.collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        name: 'j1dev-container-group',
        type: 'Microsoft.ContainerInstance/containerGroups',
        location: 'eastus',
        provisioningState: 'Succeeded',
        restartPolicy: 'Always',
        osType: 'Linux',
        sku: 'Standard',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        _type: 'azure_container_group',
        _class: ['Group'],
        webLink: `https://portal.azure.com/#@www.fake-domain.com/resource/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        _rawData: [
          {
            name: 'default',
            rawData: {
              id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
              name: 'j1dev-container-group',
              type: 'Microsoft.ContainerInstance/containerGroups',
              location: 'eastus',
              tags: {},
              provisioningState: 'Succeeded',
              containers: [
                {
                  name: 'nginx',
                  image: 'nginx',
                  command: [],
                  ports: [
                    {
                      protocol: 'TCP',
                      port: 80,
                    },
                  ],
                  environmentVariables: [],
                  resources: {
                    requests: {
                      memoryInGB: 1.5,
                      cpu: 0.5,
                    },
                  },
                  volumeMounts: [
                    {
                      name: 'nginx-mount',
                      mountPath: '/etc/test_mount',
                      readOnly: false,
                    },
                  ],
                },
                {
                  name: 'hello-world',
                  image: 'microsoft/aci-helloworld:latest',
                  command: [],
                  ports: [
                    {
                      protocol: 'TCP',
                      port: 443,
                    },
                  ],
                  environmentVariables: [],
                  resources: {
                    requests: {
                      memoryInGB: 1.5,
                      cpu: 0.5,
                    },
                  },
                },
              ],
              restartPolicy: 'Always',
              ipAddress: {
                ports: [
                  {
                    protocol: 'TCP',
                    port: 80,
                  },
                  {
                    protocol: 'TCP',
                    port: 443,
                  },
                ],
                type: 'Public',
                ip: '20.62.140.108',
                dnsNameLabel: 'j1dev-container-group-dns-keionned',
                fqdn:
                  'j1dev-container-group-dns-keionned.eastus.azurecontainer.io',
              },
              osType: 'Linux',
              volumes: [
                {
                  name: 'nginx-mount',
                  azureFile: {
                    shareName: 'j1dev',
                    readOnly: false,
                    storageAccountName: 'keionnedj1dev',
                  },
                },
              ],
              sku: 'Standard',
              initContainers: [],
            },
          },
        ],
        displayName: 'j1dev-container-group',
      }),
    );
  });

  it('should track the Volume entity', () => {
    expect(context.jobState.collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount`,
        name: 'nginx-mount',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount`,
        _type: 'azure_container_volume',
        _class: ['Disk'],
        classification: null,
        encrypted: null,
        _rawData: [
          {
            name: 'default',
            rawData: {
              name: 'nginx-mount',
              azureFile: {
                shareName: 'j1dev',
                readOnly: false,
                storageAccountName: 'keionnedj1dev',
              },
            },
          },
        ],
        displayName: 'nginx-mount',
      }),
    );
  });

  it('should track the first Container entity', () => {
    expect(context.jobState.collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx`,
        name: 'nginx',
        image: 'nginx',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx`,
        _type: 'azure_container',
        _class: ['Container'],
        _rawData: [
          {
            name: 'default',
            rawData: {
              name: 'nginx',
              image: 'nginx',
              command: [],
              ports: [
                {
                  protocol: 'TCP',
                  port: 80,
                },
              ],
              environmentVariables: [],
              resources: {
                requests: {
                  memoryInGB: 1.5,
                  cpu: 0.5,
                },
              },
              volumeMounts: [
                {
                  name: 'nginx-mount',
                  mountPath: '/etc/test_mount',
                  readOnly: false,
                },
              ],
            },
          },
        ],
        displayName: 'nginx',
      }),
    );
  });

  it('should track the second Container entity', () => {
    expect(context.jobState.collectedEntities).toContainEqual(
      expect.objectContaining({
        id: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/hello-world`,
        name: 'hello-world',
        image: 'microsoft/aci-helloworld:latest',
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/hello-world`,
        _type: 'azure_container',
        _class: ['Container'],
        _rawData: [
          {
            name: 'default',
            rawData: {
              name: 'hello-world',
              image: 'microsoft/aci-helloworld:latest',
              command: [],
              ports: [
                {
                  protocol: 'TCP',
                  port: 443,
                },
              ],
              environmentVariables: [],
              resources: {
                requests: {
                  memoryInGB: 1.5,
                  cpu: 0.5,
                },
              },
            },
          },
        ],
        displayName: 'hello-world',
      }),
    );
  });

  it('should track the Resource Group has Container Group relationship', () => {
    expect(context.jobState.collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        _type: 'azure_resource_group_has_container_group',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        displayName: 'HAS',
      }),
    );
  });

  it('should track the Container Group has Volume relationship', () => {
    expect(context.jobState.collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount`,
        _type: 'azure_container_group_has_volume',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount`,
        displayName: 'HAS',
      }),
    );
  });

  it('should track the first Container Group has Container relationship', () => {
    expect(context.jobState.collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx`,
        _type: 'azure_container_group_has_container',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx`,
        displayName: 'HAS',
      }),
    );
  });

  it('should track the second Container Group has Container relationship', () => {
    expect(context.jobState.collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group|has|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/hello-world`,
        _type: 'azure_container_group_has_container',
        _class: 'HAS',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/hello-world`,
        displayName: 'HAS',
      }),
    );
  });

  it('should track the Container connect Volume relationship', () => {
    expect(context.jobState.collectedRelationships).toContainEqual(
      expect.objectContaining({
        _key: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx|uses|/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount`,
        _type: 'azure_container_uses_volume',
        _class: 'USES',
        _fromEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx`,
        _toEntityKey: `/subscriptions/${instanceConfig.subscriptionId}/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount`,
        displayName: 'USES',
        name: 'nginx-mount',
        mountPath: '/etc/test_mount',
        readOnly: false,
      }),
    );
  });
});
