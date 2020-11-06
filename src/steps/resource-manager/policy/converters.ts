import { AzureWebLinker } from '../../../azure';
import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core/dist/src/data/converters';
import flatten from '../utils/flatten';
import { PolicyEntities } from './constants';
import { PolicyAssignment } from '@azure/arm-policy/esm/models';

export function createPolicyAssignmentEntity(
  webLinker: AzureWebLinker,
  data: PolicyAssignment,
): Entity {
  const { metadata, ...pa } = data;
  const assignedBy = metadata?.assignedBy;
  const createdOn = parseTimePropertyValue(metadata?.createdOn);
  const updatedOn = parseTimePropertyValue(metadata?.updatedOn);
  const createdBy = metadata?.createdBy;
  const updatedBy = metadata?.updatedBy;

  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        ...flatten(pa),
        _key: pa.id,
        _type: PolicyEntities.POLICY_ASSIGNMENT._type,
        _class: PolicyEntities.POLICY_ASSIGNMENT._class,
        id: pa.id,
        name: pa.displayName,
        webLink: webLinker.portalResourceUrl(pa.id),
        scope: pa.scope,
        policyDefinitionId: pa.policyDefinitionId,
        ...(assignedBy && { assignedBy }),
        ...(createdBy && { createdBy }),
        ...(createdOn && { createdOn }),
        ...(updatedBy && { updatedBy }),
        ...(updatedOn && { updatedOn }),
      },
    },
  });
}
