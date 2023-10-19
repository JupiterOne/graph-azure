import { AzureWebLinker } from '../../../azure';
import {
  assignTags,
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { parseTimePropertyValue } from '@jupiterone/integration-sdk-core/dist/src/data/converters';
import flatten from '../utils/flatten';
import { PolicyEntities } from './constants';
import {
  PolicyAssignment,
  PolicyDefinition,
  PolicySetDefinition,
} from '@azure/arm-policy/esm/models';

export function createPolicyAssignmentEntity(
  webLinker: AzureWebLinker,
  data: PolicyAssignment,
): Entity {
  // Remove parameters since they could be causing an upload error.
  const { metadata, parameters, ...pa } = data;
  const assignedBy = metadata?.assignedBy;
  const createdOn = parseTimePropertyValue(metadata?.createdOn);
  const updatedOn = parseTimePropertyValue(metadata?.updatedOn);
  const createdBy = metadata?.createdBy;
  const updatedBy = metadata?.updatedBy;
  const webLink = webLinker.portalResourceUrl(pa.id);
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
        webLink: webLink ? encodeURI(webLink) : webLink,
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

export function createPolicyDefinitionEntity(
  webLinker: AzureWebLinker,
  data: PolicyDefinition,
): Entity {
  const policyDefinitionEntity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: PolicyEntities.POLICY_DEFINITION._type,
        _class: PolicyEntities.POLICY_DEFINITION._class,
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        type: data.type,
        policyType: data.policyType,
        mode: data.mode,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
  assignTags(
    policyDefinitionEntity,
    getCompatibleTagProperties(data.metadata) as { [s: string]: string },
  ); // assignTags interface is too restrictive for k/v pairs. Assert for safety.

  return policyDefinitionEntity;
}

/**
 * Azure Policy Definitions allow arbitrary JSON to be assigned to the `metadata` property,
 * including arrays and objects. JupiterOne requires tags of type `string | number | boolean`,
 * so this filters out incompatible properties.
 */
function getCompatibleTagProperties(metadata: { [s: string]: any }) {
  const compatibleTagProperties: {
    [s: string]: string | number | boolean;
  } = {};
  for (const [k, v] of Object.entries(metadata)) {
    if (['string', 'number', 'boolean'].includes(typeof v)) {
      compatibleTagProperties[k] = v;
    }
  }
  return compatibleTagProperties;
}

export function createPolicySetDefinitionEntity(
  webLinker: AzureWebLinker,
  data: PolicySetDefinition,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id!,
        _type: PolicyEntities.POLICY_SET_DEFINITION._type,
        _class: PolicyEntities.POLICY_SET_DEFINITION._class,
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        type: data.type,
        policyType: data.policyType,
        webLink: webLinker.portalResourceUrl(data.id),
      },
    },
  });
}
