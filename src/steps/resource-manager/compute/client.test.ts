import { createMockIntegrationLogger } from '@jupiterone/integration-sdk-testing';

import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import config, {
  configFromEnv,
} from '../../../../test/integrationInstanceConfig';
import { ComputeClient } from './client';
import {
  VirtualMachine,
  Disk,
  VirtualMachineExtension,
  Gallery,
  GalleryImage,
  GalleryImageVersion,
} from '@azure/arm-compute/esm/models';

let recording: Recording;

afterEach(async () => {
  await recording.stop();
});

describe('iterateVirtualMachines', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateVirtualMachines',
    });

    const client = new ComputeClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: VirtualMachine[] = [];
    await client.iterateVirtualMachines((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1dev',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('iterateVirtualMachineDisks', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateVirtualMachineDisks',
    });

    const client = new ComputeClient(
      config,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Disk[] = [];
    await client.iterateVirtualMachineDisks((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'j1devOsDisk',
        tags: expect.objectContaining({
          environment: 'j1dev',
        }),
      }),
    ]);
  });
});

describe('iterateVirtualMachineExtensions', () => {
  async function getSetupEntities(client: ComputeClient) {
    const virtualMachines: VirtualMachine[] = [];
    await client.iterateVirtualMachines((vm) => {
      virtualMachines.push(vm);
    });

    const j1devVirtualMachines = virtualMachines.filter(
      (vm) => vm.name === 'j1dev',
    );

    expect(j1devVirtualMachines.length).toBe(1);
    const virtualMachine = j1devVirtualMachines[0];

    return { virtualMachine };
  }
  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateVirtualMachineExtensions',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new ComputeClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );
    const { virtualMachine } = await getSetupEntities(client);

    const extensions: VirtualMachineExtension[] = [];
    await client.iterateVirtualMachineExtensions(
      {
        name: virtualMachine.name!,
        id: virtualMachine.id!,
      },
      (e) => {
        extensions.push(e);
      },
    );

    expect(extensions.length).toBeGreaterThan(0);
  });
});

describe('iterateGalleries', () => {
  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateGalleries',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new ComputeClient(
      configFromEnv,
      createMockIntegrationLogger(),
      true,
    );

    const resources: Gallery[] = [];
    await client.iterateGalleries((e) => {
      resources.push(e);
    });

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'testImageGallery',
      }),
    ]);
  });
});

describe('iterateGalleryImages', () => {
  async function getSetupData(client: ComputeClient) {
    const galleries: Gallery[] = [];
    await client.iterateGalleries((g) => {
      galleries.push(g);
    });
    expect(galleries.length).toBeGreaterThan(0);
    const gallery = galleries[0];

    return { gallery };
  }

  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateGalleryImages',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new ComputeClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const { gallery } = await getSetupData(client);

    const resources: GalleryImage[] = [];
    await client.iterateGalleryImages(
      { id: gallery.id!, name: gallery.name! },
      (e) => {
        resources.push(e);
      },
    );

    expect(resources).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: 'test-image-definition',
        type: 'Microsoft.Compute/galleries/images',
        osType: 'Linux',
        osState: 'Generalized',
        hyperVGeneration: 'V1',
      }),
    ]);
  });
});

describe('iterateGalleryImageVersions', () => {
  async function getSetupData(client: ComputeClient) {
    const galleries: Gallery[] = [];
    await client.iterateGalleries((g) => {
      galleries.push(g);
    });
    expect(galleries.length).toBeGreaterThan(0);
    const gallery = galleries[0];

    const images: GalleryImage[] = [];
    await client.iterateGalleryImages(
      {
        id: gallery.id!,
        name: gallery.name!,
      },
      (i) => {
        images.push(i);
      },
    );
    expect(images.length).toBeGreaterThan(0);
    const image = images[0];

    return { image };
  }

  test('all', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'iterateGalleryImageVersions',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const client = new ComputeClient(
      configFromEnv,
      createMockIntegrationLogger(),
    );

    const { image } = await getSetupData(client);

    const resources: GalleryImageVersion[] = [];
    await client.iterateGalleryImageVersions(
      { id: image.id!, name: image.name! },
      (v) => {
        resources.push(v);
      },
    );

    expect(resources.length).toBeGreaterThan(0);
  });
});
