import { createAzureWebLinker } from '../../../azure';
import {
  createContainerGroupEntity,
  createContainerEntity,
  createVolumeEntity,
} from './converters';
import { ContainerGroup } from '@azure/arm-containerinstance/esm/models';
import { ContainerWithId, VolumeWithId } from './types';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createContainerGroupEntity', () => {
  test('properties transferred', () => {
    const data: ContainerGroup = {
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group',
      containers: [
        {
          command: [],
          environmentVariables: [],
          image: 'nginx',
          name: 'nginx',
          ports: [{ port: 80, protocol: 'TCP' }],
          resources: { requests: { cpu: 0.5, memoryInGB: 1.5 } },
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
        dnsNameLabel: 'j1dev-container-group-dns',
        fqdn: 'j1dev-container-group-dns.eastus.azurecontainer.io',
        ip: '52.186.103.187',
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
    };

    const containerGroupEntity = createContainerGroupEntity(webLinker, data);

    expect(containerGroupEntity).toMatchSnapshot();
    expect(containerGroupEntity).toMatchGraphObjectSchema({
      _class: ['Group'],
    });
  });
});

describe('createContainerEntity', () => {
  test('properties transferred', () => {
    const data: ContainerWithId = {
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/containers/nginx',
      command: [],
      environmentVariables: [],
      image: 'nginx',
      name: 'nginx',
      ports: [{ port: 80, protocol: 'TCP' }],
      resources: { requests: { cpu: 0.5, memoryInGB: 1.5 } },
    };

    const containerEntity = createContainerEntity(data);

    expect(containerEntity).toMatchSnapshot();
    expect(containerEntity).toMatchGraphObjectSchema({
      _class: ['Container'],
    });
  });
});

describe('createVolumeEntity', () => {
  test('properties transferred', () => {
    const data: VolumeWithId = {
      id:
        '/subscriptions/40474ebe-55a2-4071-8fa8-b610acdd8e56/resourceGroups/j1dev/providers/Microsoft.ContainerInstance/containerGroups/j1dev-container-group/volumes/nginx-mount',
      name: 'nginx-mount',
      azureFile: {
        shareName: 'j1dev',
        readOnly: false,
        storageAccountName: 'keionnedj1dev',
      },
    };

    const volumeEntity = createVolumeEntity(data);

    expect(volumeEntity).toMatchSnapshot();
    expect(volumeEntity).toMatchGraphObjectSchema({
      _class: ['Disk'],
    });
  });
});
