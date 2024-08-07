import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';

// RM Advisor Entities
export const [ServiceEntityMetadata, createServiceAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] API Management Service',
    _class: ['Gateway'],
    _type: createEntityType('api_management_service'),
    description: 'Azure API Management Service',
    schema: SchemaType.Object({
      function: SchemaType.Array(
        SchemaType.String(SchemaType.Literal('api-gateway')),
      ),
      category: SchemaType.Array(
        SchemaType.String(SchemaType.Literal('application')),
      ),
    }),
  });

export const [ApiEntityMetadata, createApiAssignEntity] = createEntityMetadata({
  resourceName: '[RM] API Management API',
  _class: ['ApplicationEndpoint'],
  _type: createEntityType('api_management_api'),
  description: 'Azure API Management API',
  schema: SchemaType.Object({}),
});
