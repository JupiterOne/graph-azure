import { StepEntityMetadata } from '@jupiterone/integration-sdk-core';

// Fetch Resource Groups
export const STEP_RM_RESOURCES_RESOURCE_GROUPS = 'rm-resources-resource-groups';
export const STEP_RM_RESOURCES_RESOURCE_GROUP_LOCKS =
  'rm-resources-resource-group-resource-locks';

export const RESOURCE_GROUP_ENTITY: StepEntityMetadata = {
  _type: 'azure_resource_group',
  _class: ['Group'],
  resourceName: '[RM] Resource Group',
};

export const RESOURCE_GROUP_RESOURCE_LOCK_ENTITY: StepEntityMetadata = {
  _type: 'azure_resource_group_resource_lock',
  _class: ['Rule'],
  resourceName: '[RM] Resource Group Resource Lock',
};
