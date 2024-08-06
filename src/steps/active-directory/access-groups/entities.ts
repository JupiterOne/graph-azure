import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from '../../../helpers';
import { accessPackageEntites } from './constants';

// Access Package Entities
export const [AccessPackageEntityMetadata, createAccessPackageAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Access Package',
    _class: ['Service'],
    _type: createEntityType('access_packages_services'),
    description: 'Resource Manager Access Package',
    schema: SchemaType.Object({
      resourceName: SchemaType.String(
        SchemaType.Literal('[RM] Access Package'),
      ),
      category: SchemaType.Array(SchemaType.Literal('infrastructure')),
      function: SchemaType.Array(SchemaType.Literal('workflow')),
    }),
  });

export const [
  AccessPackageAssignmentEntityMetadata,
  createAccessPackageAssignmentAssignEntity,
] = createEntityMetadata({
  resourceName: '[RM] Access Package Assignment',
  _class: ['AccessRole'],
  _type: createEntityType('access_packages_service_assignment'),
  description: 'Resource Manager Access Package Assignment',
  schema: SchemaType.Object({
    resourceName: SchemaType.String(
      SchemaType.Literal('[RM] Access Package Assignment'),
    ),
    state: SchemaType.Optional(SchemaType.String()),
    accessPackage: SchemaType.Optional(SchemaType.String()),
    assignmentPolicy: SchemaType.Optional(SchemaType.String()),
    userId: SchemaType.Optional(SchemaType.String()),
    groupId: SchemaType.Optional(SchemaType.String()),
  }),
});

export const [
  AccessPackageAssignmentPolicyEntityMetadata,
  createAccessPackageAssignmentPolicyAssignEntity,
] = createEntityMetadata({
  resourceName: '[RM] Access Package Assignment Policy',
  _class: ['AccessPolicy'],
  _type: createEntityType('access_packages_policy'),
  description: 'Resource Manager Access Package Assignment Policy',
  schema: SchemaType.Object({
    resourceName: SchemaType.String(
      SchemaType.Literal('[RM] Access Package Assignment Policy'),
    ),
    expirationEndDateTimeOn: SchemaType.Optional(
      SchemaType.Number({
        deprecated: true,
        description: 'Please use `expirationEndOn` instead',
      }),
    ),
    expirationEndOn: SchemaType.Optional(SchemaType.Number()),
    expirationDuration: SchemaType.Optional(SchemaType.String()),
    expirationType: SchemaType.Optional(SchemaType.String()),
  }),
});

export const [
  AccessPackageRequestEntityMetadata,
  createAccessPackageRequestAssignEntity,
] = createEntityMetadata({
  resourceName: '[RM] Access Package Assignment Request',
  _class: ['Requirement'],
  _type: createEntityType('access_packages_request'),
  description: 'Resource Manager Access Package Assignment Request',
  schema: SchemaType.Object({
    resourceName: SchemaType.String(
      SchemaType.Literal('[RM] Access Package Assignment Request'),
    ),
    requestType: SchemaType.Optional(SchemaType.String()),
    status: SchemaType.Optional(SchemaType.String()),
    id: SchemaType.Optional(SchemaType.String()),
    objectId: SchemaType.Optional(SchemaType.String()),
    title: SchemaType.String(SchemaType.Literal('Access Package Request')),
  }),
});

export const [
  AccessPackageApproverEntityMetadata,
  createAccessPackageApproverAssignEntity,
] = createEntityMetadata({
  resourceName: '[RM] Access Package Assignment Approver',
  _class: ['Review'],
  _type: createEntityType('access_packages_approver'),
  description: 'Resource Manager Access Package Assignment Approver',
  schema: SchemaType.Object({
    resourceName: SchemaType.String(
      SchemaType.Literal('[RM] Access Package Assignment Approver'),
    ),
    reviewResult: SchemaType.Optional(SchemaType.String()),
    status: SchemaType.Optional(SchemaType.String()),
    id: SchemaType.Optional(SchemaType.String()),
    reviewedById: SchemaType.Optional(SchemaType.String()),
  }),
});

export const [
  AccessPackageCatalogEntityMetadata,
  createAccessPackageCatalogAssignEntity,
] = createEntityMetadata({
  resourceName: '[RM] Access Package Catalog',
  _class: ['Resource'],
  _type: createEntityType('access_packages_catalog'),
  description: 'Resource Manager Access Package Catalog',
  schema: SchemaType.Object({
    resourceName: SchemaType.String(
      SchemaType.Literal('[RM] Access Package Catalog'),
    ),
    catalogType: SchemaType.Optional(SchemaType.String()),
    state: SchemaType.Optional(SchemaType.String()),
    resourceAppId: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
    accessPackageId: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
  }),
});

export const [ApplicationEntityMetadata, createApplicationAssignEntity] =
  createEntityMetadata({
    resourceName: '[RM] Azure Application',
    _class: ['Application'],
    _type: createEntityType('application'),
    description: 'Resource Manager Azure Application',
    schema: SchemaType.Object({
      resourceName: SchemaType.String(
        SchemaType.Literal('[RM] Azure Application'),
      ),
      publisherDomain: SchemaType.Optional(SchemaType.String()),
      signInAudience: SchemaType.Optional(SchemaType.String()),
      appId: SchemaType.Optional(SchemaType.String()),
    }),
  });
