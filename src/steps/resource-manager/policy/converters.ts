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
  const createdOn = parseTimePropertyValue(data.metadata?.createdOn);
  const updatedOn = parseTimePropertyValue(data.metadata?.updatedOn);

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
        assignedBy: data.metadata?.assignedBy,
        createdBy: data.metadata?.createdBy,
        ...(createdOn && { createdOn }),
        updatedBy: data.metadata?.updatedBy,
        ...(updatedOn && { updatedOn }),
      },
    },
  });
}
