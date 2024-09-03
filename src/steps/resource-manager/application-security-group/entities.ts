import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';

// Security Group Entities
export const [
  ApplicationSecurityGroupEntityMetadata,
  createApplicationSecurityGroupAssignEntity,
] = createEntityMetadata({
  resourceName: 'Azure Application Security Group',
  _class: ['Firewall'],
  _type: createEntityType('application_security_group'),
  description: 'Azure Application Security Group',
  schema: SchemaType.Object({
    etag: SchemaType.Optional(SchemaType.String()),
    provisioningState: SchemaType.Optional(SchemaType.String()),
    resourceGuid: SchemaType.Optional(SchemaType.String()),
    type: SchemaType.Optional(SchemaType.String()),
  }),
});
