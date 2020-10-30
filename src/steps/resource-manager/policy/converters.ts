import { AzureWebLinker } from '../../../azure';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core/dist/src/data/converters';
import { flatten } from './helpers';
import { PolicyEntities } from './constants';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';

export function createPolicyAssignmentEntity(
  webLinker: AzureWebLinker,
  data: PolicyAssignment,
): Entity {
  const assignedBy = data.metadata?.assignedBy;
  const createdOn = parseTimePropertyValue(data.metadata?.createdOn);
  const updatedOn = parseTimePropertyValue(data.metadata?.updatedOn);
  const createdBy = data.metadata?.createdBy;
  const updatedBy = data.metadata?.updatedBy;

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flatten(data),
        _key: data.id,
        _type: PolicyEntities.POLICY_ASSIGNMENT._type,
        _class: PolicyEntities.POLICY_ASSIGNMENT._class,
        id: data.id,
        name: data.displayName,
        webLink: webLinker.portalResourceUrl(data.id),
        scope: data.scope,
        policyDefinitionId: data.policyDefinitionId,
        ...(assignedBy && { assignedBy }),
        ...(createdBy && { createdBy }),
        ...(createdOn && { createdOn }),
        ...(updatedBy && { updatedBy }),
        ...(updatedOn && { updatedOn }),
      },
    },
  });
}
