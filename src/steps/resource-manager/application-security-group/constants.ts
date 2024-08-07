import {
  generateRelationshipType,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { entities } from '../compute/constants';
import { NetworkEntities } from '../network/constants';
import { ApplicationSecurityGroupEntityMetadata } from './entities';

export const STEP_AZURE_APPLICATION_SECURITY_GROUP =
  'rm-azure-application-security-group';

export const STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION =
  'rm-azure-application-security-group-virtual-machine-relation';

export const ApplicationSecurityGroupEntities = {
  AZURE_APPLICATION_SECURITY_GROUP: ApplicationSecurityGroupEntityMetadata,
};

export const AzureApplicationSecurityGroupRelationships = {
  AZURE_APPLICATION_SECURITY_GROUP_PROTECTS_VIRTUAL_MACHINE: {
    _type: generateRelationshipType(
      RelationshipClass.PROTECTS,
      ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP,
      entities.VIRTUAL_MACHINE,
    ),
    sourceType:
      ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP._type,
    _class: RelationshipClass.PROTECTS,
    targetType: entities.VIRTUAL_MACHINE._type,
  },

  AZURE_APPLICATION_SECURITY_GROUP_ALLOWS_FIREWALL_RULE_GROUP: {
    _type: generateRelationshipType(
      RelationshipClass.PROTECTS,
      ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP,
      NetworkEntities.FIREWALL_RULE_GROUP,
    ),
    sourceType:
      ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP._type,
    _class: RelationshipClass.PROTECTS,
    targetType: NetworkEntities.FIREWALL_RULE_GROUP._type,
  },
};
