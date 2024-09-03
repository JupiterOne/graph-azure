import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';

// Conditional Access Entities
export const [
  ConditionalAccessServiceEntityMetadata,
  createConditionalAccessServiceAssignEntity,
] = createEntityMetadata({
  resourceName: '[AD] Conditional Access',
  _class: ['Service'],
  _type: createEntityType('conditional_access_service'),
  description: 'Azure Active Directory Conditional Access Service',
  schema: SchemaType.Object({
    category: SchemaType.Array(SchemaType.String(SchemaType.Literal('other'))),
    function: SchemaType.Array(
      SchemaType.String(SchemaType.Literal('access-review')),
    ),
    name: SchemaType.String(SchemaType.Literal('Conditional Access Service')),
  }),
});

export const [
  ConditionalAccessPolicyEntityMetadata,
  createConditionalAccessPolicyAssignEntity,
] = createEntityMetadata({
  resourceName: '[AD] Conditional Access Policy',
  _class: ['AccessPolicy'],
  _type: createEntityType('conditional_access_policy'),
  description: 'Azure Active Directory Conditional Access Policy',
  schema: SchemaType.Object({
    templateId: SchemaType.Optional(
      SchemaType.Union([SchemaType.String(), SchemaType.Null()]),
    ),
    state: SchemaType.Optional(SchemaType.String()),
    createdDateTime: SchemaType.Optional(
      SchemaType.Number({
        deprecated: true,
        description: 'Please use `createdOn` instead',
      }),
    ),
    includeLocations: SchemaType.Optional(
      SchemaType.Array(SchemaType.String()),
    ),
    includeUsers: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
    includeGroups: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
    includeApplication: SchemaType.Optional(
      SchemaType.Array(SchemaType.String()),
    ),
  }),
});

export const [
  ConditionalAccessTemplateEntityMetadata,
  createConditionalAccessTemplateAssignEntity,
] = createEntityMetadata({
  resourceName: '[AD] Conditional Access Template',
  _class: ['AccessPolicy'],
  _type: createEntityType('conditional_access_template'),
  description: 'Azure Active Directory Conditional Access Template',
  schema: SchemaType.Object({
    scenarios: SchemaType.Optional(SchemaType.String()),
  }),
});

export const [
  ConditionalAccessNamedLocationEntityMetadata,
  createConditionalAccessNamedLocationAssignEntity,
] = createEntityMetadata({
  resourceName: '[AD] Conditional Access Named Location',
  _class: ['Network'],
  _type: createEntityType('conditional_access_named_location'),
  description: 'Azure Active Directory Conditional Access Named Location',
  schema: SchemaType.Object({
    scenarios: SchemaType.Optional(SchemaType.String()),
    createdDateTime: SchemaType.Optional(
      SchemaType.Number({
        deprecated: true,
        description: 'Please use `createdOn` instead',
      }),
    ),
    countriesAndRegions: SchemaType.Optional(
      SchemaType.Array(SchemaType.String()),
    ),
    countryLookupMethod: SchemaType.Optional(SchemaType.String()),
    public: SchemaType.Boolean({
      description:
        'This value is not applicable to this entity, however is expected on entities with a _class of `Network`',
      default: false,
    }),
    internal: SchemaType.Boolean({
      description:
        'This value is not applicable to this entity, however is expected on entities with a _class of `Network`',
      default: false,
    }),
  }),
});

export const [
  ConditionalAccessAuthorizationContextEntityMetadata,
  createConditionalAccessAuthorizationContextAssignEntity,
] = createEntityMetadata({
  resourceName: '[AD] Conditional Access Authorization Context',
  _class: ['Resource'],
  _type: createEntityType('conditional_access_authorization_context'),
  description:
    'Azure Active Directory Conditional Access Authorization Context',
  schema: SchemaType.Object({
    isAvailable: SchemaType.Optional(SchemaType.Boolean()),
  }),
});
