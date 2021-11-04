import { Relationship } from '@jupiterone/integration-sdk-core';
import { buildComputeNetworkRelationships } from '.';
import { createMockAzureStepExecutionContext } from '../../../../test/createMockAzureStepExecutionContext';
import { filterGraphObjects } from '../../../../test/helpers/filterGraphObjects';
import { getMockAccountEntity } from '../../../../test/helpers/getMockEntity';
import {
  getMatchRequestsBy,
  Recording,
  setupAzureRecording,
} from '../../../../test/helpers/recording';
import { configFromEnv } from '../../../../test/integrationInstanceConfig';
import { IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE } from '../../active-directory/constants';
import { fetchVirtualMachines } from '../compute';
import { VIRTUAL_MACHINE_ENTITY_TYPE } from '../compute/constants';
import {
  fetchNetworkInterfaces,
  fetchNetworkSecurityGroups,
  fetchPublicIPAddresses,
  fetchVirtualNetworks,
} from '../network';
import { NetworkEntities } from '../network/constants';
import { SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE, VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE, VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE } from './constants';

let recording: Recording;

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

describe('rm-compute-network-relationships', () => {
  async function getSetupEntities(config: IntegrationConfig) {
    const accountEntity = getMockAccountEntity(config);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: config,
      entities: [accountEntity],
      setData: {
        [ACCOUNT_ENTITY_TYPE]: accountEntity,
      },
    });

    await fetchVirtualMachines(context);
    await fetchPublicIPAddresses(context);
    await fetchNetworkInterfaces(context);
    await fetchNetworkSecurityGroups(context);
    await fetchVirtualNetworks(context);

    const collectedEntities = context.jobState.collectedEntities;

    const virtualMachineEntities = collectedEntities.filter(
      (e) => e._type === VIRTUAL_MACHINE_ENTITY_TYPE,
    );
    expect(virtualMachineEntities.length).toBeGreaterThan(0);

    const networkInterfaceEntities = collectedEntities.filter(
      (e) => e._type === NetworkEntities.NETWORK_INTERFACE._type,
    );
    expect(networkInterfaceEntities.length).toBeGreaterThan(0);

    const publicIpEntities = collectedEntities.filter(
      (e) => e._type === NetworkEntities.PUBLIC_IP_ADDRESS._type,
    );
    expect(publicIpEntities.length).toBeGreaterThan(0);

    const subnetEntities = collectedEntities.filter(
      (e) => e._type === NetworkEntities.SUBNET._type,
    );
    expect(subnetEntities.length).toBeGreaterThan(0);

    return {
      virtualMachineEntities,
      networkInterfaceEntities,
      publicIpEntities,
      subnetEntities,
    };
  }

  function separateComputeNetworkRelationships(relationships: Relationship[]) {
    const {
      targets: vmNicRelationships,
      rest: restAfterVmNic,
    } = filterGraphObjects(
      relationships,
      (r) => r._type === VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
    );
    const {
      targets: subnetVmRelationships,
      rest: restAfterSubnetVm,
    } = filterGraphObjects(
      restAfterVmNic,
      (r) => r._type === SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
    );
    const {
      targets: vmPublicIpRelationships,
      rest: restAfterVmPublicIp,
    } = filterGraphObjects(
      restAfterSubnetVm,
      (r) => r._type === VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
    );

    return {
      vmNicRelationships,
      subnetVmRelationships,
      vmPublicIpRelationships,
      rest: restAfterVmPublicIp,
    };
  }

  test('success', async () => {
    recording = setupAzureRecording({
      directory: __dirname,
      name: 'rm-compute-network-relationships',
      options: {
        matchRequestsBy: getMatchRequestsBy({ config: configFromEnv }),
      },
    });

    const {
      virtualMachineEntities,
      networkInterfaceEntities,
      publicIpEntities,
      subnetEntities,
    } = await getSetupEntities(configFromEnv);

    const context = createMockAzureStepExecutionContext({
      instanceConfig: configFromEnv,
      entities: [
        ...virtualMachineEntities,
        ...networkInterfaceEntities,
        ...publicIpEntities,
        ...subnetEntities,
      ],
    });

    await buildComputeNetworkRelationships(context);

    expect(context.jobState.collectedEntities).toHaveLength(0);

    const {
      vmNicRelationships,
      subnetVmRelationships,
      vmPublicIpRelationships,
      rest: restRelationships,
    } = separateComputeNetworkRelationships(
      context.jobState.collectedRelationships,
    );

    expect(vmNicRelationships.length).toBeGreaterThan(0);
    expect(vmNicRelationships).toMatchDirectRelationshipSchema({});

    expect(subnetVmRelationships.length).toBeGreaterThan(0);
    expect(subnetVmRelationships).toMatchDirectRelationshipSchema({});

    expect(vmPublicIpRelationships.length).toBeGreaterThan(0);
    expect(vmPublicIpRelationships).toMatchDirectRelationshipSchema({});

    expect(restRelationships).toHaveLength(0);
  }, 60_000);
});
