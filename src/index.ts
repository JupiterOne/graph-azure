import {
  IntegrationExecutionContext,
  IntegrationInvocationConfig,
  StepStartStates,
} from "@jupiterone/integration-sdk";

import {
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  ACCOUNT_USER_RELATIONSHIP_TYPE,
  GROUP_ENTITY_TYPE,
  GROUP_MEMBER_ENTITY_TYPE,
  GROUP_MEMBER_RELATIONSHIP_TYPE,
  LOAD_BALANCER_BACKEND_NIC_RELATIONSHIP_TYPE,
  LOAD_BALANCER_ENTITY_TYPE,
  NETWORK_INTERFACE_ENTITY_TYPE,
  PUBLIC_IP_ADDRESS_ENTITY_TYPE,
  SECURITY_GROUP_ENTITY_TYPE,
  SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
  SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
  SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
  SUBNET_ENTITY_TYPE,
  SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
  USER_ENTITY_TYPE,
  VIRTUAL_MACHINE_ENTITY_TYPE,
  VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
  VIRTUAL_NETWORK_ENTITY_TYPE,
  VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
  VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE,
  DISK_ENTITY_TYPE,
} from "./jupiterone";
import {
  fetchAccount,
  fetchGroupMembers,
  fetchGroups,
  fetchUsers,
} from "./steps/active-directory";
import {
  fetchVirtualMachines,
  fetchVirtualMachineImages,
  fetchVirtualMachineDisks,
} from "./steps/resource-manager/compute";
import { buildComputeNetworkRelationships } from "./steps/resource-manager/interservice";
import {
  ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
  fetchKeyVaults,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
} from "./steps/resource-manager/key-vault";
import {
  fetchLoadBalancers,
  fetchNetworkInterfaces,
  fetchNetworkSecurityGroups,
  fetchPublicIPAddresses,
  fetchVirtualNetworks,
} from "./steps/resource-manager/network";
import { IntegrationConfig } from "./types";
import validateInvocation from "./validateInvocation";

export const AD_ACCOUNT = "ad-account";
export const AD_GROUPS = "ad-groups";
export const AD_GROUP_MEMBERS = "ad-group-members";
export const AD_USERS = "ad-users";

export const RM_KEYVAULT_VAULTS = "rm-keyvault-vaults";

export const RM_NETWORK_PUBLIC_IP_ADDRESSES = "rm-network-ip-addresses";
export const RM_NETWORK_INTERFACES = "rm-network-interfaces";
export const RM_NETWORK_SECURITY_GROUPS = "rm-network-security-groups";
export const RM_NETWORK_VIRTUAL_NETWORKS = "rm-network-virtual-networks";
export const RM_NETWORK_LOAD_BALANCERS = "rm-network-load-balancers";

export const RM_COMPUTE_VIRTUAL_MACHINE_IMAGES =
  "rm-compute-virtual-machine-images";
export const RM_COMPUTE_VIRTUAL_MACHINE_DISKS =
  "rm-compute-virutal-machine-disks";
export const RM_COMPUTE_VIRTUAL_MACHINES = "rm-compute-virtual-machines";

export const RM_COMPUTE_NETWORK_RELATIONSHIPS =
  "rm-compute-network-relationships";

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> = {
  instanceConfigFields: {
    clientId: {
      type: "string",
      mask: false,
    },
    clientSecret: {
      type: "string",
      mask: true,
    },
    directoryId: {
      type: "string",
      mask: false,
    },
    subscriptionId: {
      type: "string",
      mask: false,
    },
    ingestActiveDirectory: {
      type: "boolean",
      mask: false,
    },
  },
  validateInvocation,

  getStepStartStates: (
    executionContext: IntegrationExecutionContext<IntegrationConfig>,
  ): StepStartStates => {
    const config = executionContext.instance.config || {};

    const activeDirectory = { disabled: !config.ingestActiveDirectory };
    const resourceManager = {
      disabled: typeof config.subscriptionId !== "string",
    };

    let states: StepStartStates = {};

    if (activeDirectory.disabled) {
      states = {
        ...states,
        [AD_GROUPS]: activeDirectory,
        [AD_GROUP_MEMBERS]: activeDirectory,
        [AD_USERS]: activeDirectory,
      };
    }

    if (resourceManager.disabled) {
      states = {
        ...states,
        [RM_KEYVAULT_VAULTS]: resourceManager,
        [RM_NETWORK_VIRTUAL_NETWORKS]: resourceManager,
        [RM_NETWORK_SECURITY_GROUPS]: resourceManager,
        [RM_NETWORK_INTERFACES]: resourceManager,
        [RM_NETWORK_PUBLIC_IP_ADDRESSES]: resourceManager,
        [RM_NETWORK_LOAD_BALANCERS]: resourceManager,
        [RM_COMPUTE_VIRTUAL_MACHINE_IMAGES]: resourceManager,
        [RM_COMPUTE_VIRTUAL_MACHINE_DISKS]: resourceManager,
        [RM_COMPUTE_VIRTUAL_MACHINES]: resourceManager,
        [RM_COMPUTE_NETWORK_RELATIONSHIPS]: resourceManager,
      };
    }

    return states;
  },

  integrationSteps: [
    {
      id: AD_ACCOUNT,
      name: "Active Directory Info",
      types: [ACCOUNT_ENTITY_TYPE],
      executionHandler: fetchAccount,
    },
    {
      id: AD_USERS,
      name: "Active Directory Users",
      types: [USER_ENTITY_TYPE, ACCOUNT_USER_RELATIONSHIP_TYPE],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchUsers,
    },
    {
      id: AD_GROUPS,
      name: "Active Directory Groups",
      types: [GROUP_ENTITY_TYPE, ACCOUNT_GROUP_RELATIONSHIP_TYPE],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchGroups,
    },
    {
      id: AD_GROUP_MEMBERS,
      name: "Active Directory Group Members",
      types: [GROUP_MEMBER_ENTITY_TYPE, GROUP_MEMBER_RELATIONSHIP_TYPE],
      dependsOn: [AD_GROUPS],
      executionHandler: fetchGroupMembers,
    },
    {
      id: RM_KEYVAULT_VAULTS,
      name: "Key Vaults",
      types: [
        KEY_VAULT_SERVICE_ENTITY_TYPE,
        ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
      ],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchKeyVaults,
    },
    {
      id: RM_NETWORK_PUBLIC_IP_ADDRESSES,
      name: "Public IP Addresses",
      types: [PUBLIC_IP_ADDRESS_ENTITY_TYPE],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchPublicIPAddresses,
    },
    {
      id: RM_NETWORK_INTERFACES,
      name: "Network Interfaces",
      types: [NETWORK_INTERFACE_ENTITY_TYPE],
      dependsOn: [AD_ACCOUNT, RM_NETWORK_PUBLIC_IP_ADDRESSES],
      executionHandler: fetchNetworkInterfaces,
    },
    {
      id: RM_NETWORK_VIRTUAL_NETWORKS,
      name: "Virtual Networks",
      types: [
        VIRTUAL_NETWORK_ENTITY_TYPE,
        SUBNET_ENTITY_TYPE,
        VIRTUAL_NETWORK_SUBNET_RELATIONSHIP_TYPE,
        SECURITY_GROUP_SUBNET_RELATIONSHIP_TYPE,
      ],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchVirtualNetworks,
    },
    {
      id: RM_NETWORK_SECURITY_GROUPS,
      name: "Network Security Groups",
      types: [
        SECURITY_GROUP_ENTITY_TYPE,
        SECURITY_GROUP_NIC_RELATIONSHIP_TYPE,
        SECURITY_GROUP_RULE_RELATIONSHIP_TYPE,
      ],
      dependsOn: [AD_ACCOUNT, RM_NETWORK_INTERFACES],
      executionHandler: fetchNetworkSecurityGroups,
    },
    {
      id: RM_NETWORK_LOAD_BALANCERS,
      name: "Load Balancers",
      types: [
        LOAD_BALANCER_ENTITY_TYPE,
        LOAD_BALANCER_BACKEND_NIC_RELATIONSHIP_TYPE,
      ],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchLoadBalancers,
    },
    {
      id: RM_COMPUTE_VIRTUAL_MACHINE_IMAGES,
      name: "Virtual Machine Disk Images",
      types: [VIRTUAL_MACHINE_IMAGE_ENTITY_TYPE],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchVirtualMachineImages,
    },
    {
      id: RM_COMPUTE_VIRTUAL_MACHINE_DISKS,
      name: "Virtual Machine Disks",
      types: [DISK_ENTITY_TYPE],
      dependsOn: [AD_ACCOUNT],
      executionHandler: fetchVirtualMachineDisks,
    },
    {
      id: RM_COMPUTE_VIRTUAL_MACHINES,
      name: "Virtual Machines",
      types: [
        VIRTUAL_MACHINE_ENTITY_TYPE,
        LOAD_BALANCER_BACKEND_NIC_RELATIONSHIP_TYPE,
      ],
      dependsOn: [AD_ACCOUNT, RM_COMPUTE_VIRTUAL_MACHINE_IMAGES],
      executionHandler: fetchVirtualMachines,
    },
    {
      id: RM_COMPUTE_NETWORK_RELATIONSHIPS,
      name: "Compute Network Relationships",
      types: [
        VIRTUAL_MACHINE_NIC_RELATIONSHIP_TYPE,
        SUBNET_VIRTUAL_MACHINE_RELATIONSHIP_TYPE,
        VIRTUAL_MACHINE_PUBLIC_IP_ADDRESS_RELATIONSHIP_TYPE,
      ],
      dependsOn: [
        AD_ACCOUNT,
        RM_NETWORK_INTERFACES,
        RM_NETWORK_PUBLIC_IP_ADDRESSES,
      ],
      executionHandler: buildComputeNetworkRelationships,
    },
  ],
};
