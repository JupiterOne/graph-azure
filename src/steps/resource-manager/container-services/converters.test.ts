import { createAzureWebLinker } from '../../../azure';
import { ManagedCluster } from '@azure/arm-containerservice/esm/models';
import { createClusterEntitiy } from './converters';

const webLinker = createAzureWebLinker('something.onmicrosoft.com');

describe('createClusterEntity', () => {
  test('properties transferred', () => {
    const data: ManagedCluster = {
      id: 'id',
      name: 'name',
      sku: {
        name: 'Basic',
      },
      identity: {
        principalId: 'principalId',
        tenantId: 'tenantId',
      },
      provisioningState: 'Succeeded',
      maxAgentPools: 10,
      kubernetesVersion: '1.15.3',
      dnsPrefix: 'dnsPrefix',
      fqdn: 'fqdn',
      nodeResourceGroup: 'nodeResourceGroup',
      enableRBAC: true,
      enablePodSecurityPolicy: false,
      disableLocalAccounts: false,
      location: 'location',
    };

    expect(createClusterEntitiy(webLinker, data)).toEqual({
      _key: 'id',
      _type: 'azure_container_services_cluster',
      _class: ['Cluster'],
      _rawData: [{ name: 'default', rawData: data }],
      id: 'id',
      createdOn: undefined,
      displayName: 'name',
      name: 'name',
      skuName: 'Basic',
      location: 'location',
      principalId: 'principalId',
      tenantId: 'tenantId',
      provisioningState: 'Succeeded',
      maxAgentPools: 10,
      kubernetesVersion: '1.15.3',
      dnsPrefix: 'dnsPrefix',
      fqdn: 'fqdn',
      nodeResourceGroup: 'nodeResourceGroup',
      enableRBAC: true,
      enablePodSecurityPolicy: false,
      disableLocalAccounts: false,
      webLink: webLinker.portalResourceUrl('id'),
    });
  });
});
