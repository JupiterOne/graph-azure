import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';
import {
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { IntegrationConfig } from '../../../types';
import { ContainerInstanceClient } from './client';
import { ContainerGroup } from '@azure/arm-containerinstance/esm/models';

// developer used different creds than ~/test/integrationInstanceConfig
const config: IntegrationConfig = {
  clientId: process.env.CLIENT_ID || 'clientId',
  clientSecret: process.env.CLIENT_SECRET || 'clientSecret',
  directoryId: 'bcd90474-9b62-4040-9d7b-8af257b1427d',
  subscriptionId: '40474ebe-55a2-4071-8fa8-b610acdd8e56',
};

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterate container groups', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateContainerGroups',
    });

    const client = new ContainerInstanceClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: ContainerGroup[] = [];
    const resourceGroupInfo = {
      resourceGroupName: 'j1dev',
    };

    await client.iterateContainerGroups(resourceGroupInfo, (e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      {
        id: `/subscriptions/${config.subscriptionId}/resourceGroups/${resourceGroupInfo.resourceGroupName}/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group`,
        containers: [
          {
            command: [],
            environmentVariables: [],
            image: 'nginx',
            name: 'nginx',
            ports: [{ port: 80, protocol: 'TCP' }],
            resources: { requests: { cpu: 0.5, memoryInGB: 1.5 } },
            volumeMounts: [
              {
                mountPath: '/etc/test_mount',
                name: 'nginx-mount',
                readOnly: false,
              },
            ],
          },
          {
            command: [],
            environmentVariables: [],
            image: 'microsoft/aci-helloworld:latest',
            name: 'hello-world',
            ports: [{ port: 443, protocol: 'TCP' }],
            resources: { requests: { cpu: 0.5, memoryInGB: 1.5 } },
          },
        ],
        initContainers: [],
        ipAddress: {
          dnsNameLabel: 'j1dev-container-group-dns-keionned',
          fqdn: 'j1dev-container-group-dns-keionned.eastus.azurecontainer.io',
          ip: '20.62.140.108',
          ports: [
            { port: 80, protocol: 'TCP' },
            { port: 443, protocol: 'TCP' },
          ],
          type: 'Public',
        },
        location: 'eastus',
        name: 'j1dev-container-group',
        osType: 'Linux',
        provisioningState: 'Succeeded',
        restartPolicy: 'Always',
        sku: 'Standard',
        tags: {},
        type: 'Microsoft.ContainerInstance/containerGroups',
        volumes: [
          {
            azureFile: {
              readOnly: false,
              shareName: 'j1dev',
              storageAccountName: 'keionnedj1dev',
            },
            name: 'nginx-mount',
          },
        ],
      },
    ]);
  });
});
