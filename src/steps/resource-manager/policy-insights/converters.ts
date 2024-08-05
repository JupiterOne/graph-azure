import { AzureWebLinker } from '../../../azure';
import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { PolicyInsightEntities } from './constants';
import { PolicyState } from '@azure/arm-policyinsights/esm/models';

export function getPolicyStateKey(data: PolicyState, isLatest: boolean) {
  return `${data.policyAssignmentId}:${data.policyDefinitionId}:${
    data.resourceId
  }:${data.policyDefinitionReferenceId}:${
    isLatest ? 'latest' : data.timestamp
  }`;
}

export function createPolicyStateEntity(
  webLinker: AzureWebLinker,
  data: PolicyState,
  isLatest: boolean,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getPolicyStateKey(data, isLatest),
        _type: PolicyInsightEntities.POLICY_STATE._type,
        _class: PolicyInsightEntities.POLICY_STATE._class,
        name: data.policyDefinitionReferenceId,
        displayName: data.policyDefinitionReferenceId,
        title: data.policyDefinitionReferenceId,
        timestamp: parseTimePropertyValue(data.timestamp),
        isCompliant: data.isCompliant,
        complianceState: data.complianceState,
        subscriptionId: data.subscriptionId,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        resourceLocation: data.resourceLocation,
        resourceGroup: data.resourceGroup,
        resourcesTags: data.resourceTags,
        policyAssignmentId: data.policyAssignmentId,
        policyAssignmentName: data.policyAssignmentName,
        policyAssignmentScope: data.policyAssignmentScope,
        policyAssignmentVersion: data.policyAssignmentVersion,
        policyDefinitionId: data.policyDefinitionId,
        policyDefinitionName: data.policyDefinitionName,
        policyDefinitionVersion: data.policyDefinitionVersion,
        policyDefinitionGroupNames: data.policyDefinitionGroupNames,
        policyDefinitionReferenceId: data.policyDefinitionReferenceId,
        policySetDefinitionId: data.policySetDefinitionId,
        policySetDefinitionName: data.policySetDefinitionName,
        policySetDefinitionVersion: data.policySetDefinitionVersion,
        managementGroupIds: data.managementGroupIds?.split(','),
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
