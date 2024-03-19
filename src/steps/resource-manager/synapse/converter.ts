import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { AzureWebLinker } from '../../../azure';
import { Workspace } from '@azure/arm-synapse';
import { SynapseEntities } from './constant';

export function createWorkspaceEntity(
  webLinker: AzureWebLinker,
  data: Workspace,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.workspaceUID as string,
        _type: SynapseEntities.WORKSPACE._type,
        _class: SynapseEntities.WORKSPACE._class,
        id: data.id,
        name: data.name,
        webLink: webLinker.portalResourceUrl(data.id),
        type: data.type,
      },
    },
  });
}
