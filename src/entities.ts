import { SchemaType } from '@jupiterone/integration-sdk-core';
import { createEntityType, createEntityMetadata } from './helpers';

// Active Directory Entities
export const [AccountEntityMetadata, createAccountAssignEntity] =
  createEntityMetadata({
    resourceName: '[AD] Account',
    _class: ['Account'],
    _type: createEntityType('account'),
    description: 'Azure Active Directory Account',
    schema: SchemaType.Object({
      organizationName: SchemaType.Optional(SchemaType.String()),
      defaultDomain: SchemaType.Optional(SchemaType.String()),
      verifiedDomains: SchemaType.Optional(
        SchemaType.Array(SchemaType.String()),
      ),
      securityDefaultsEnabled: SchemaType.Optional(SchemaType.Boolean()),
    }),
  });

export const [UserEntityMetadata, createUserAssignEntity] =
  createEntityMetadata({
    resourceName: '[AD] User',
    _class: ['User'],
    _type: createEntityType('user'),
    description: 'Azure Active Directory User',
    schema: SchemaType.Object({
      mfaMethods: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
      accountEnabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isAccountEnabled` instead',
        }),
      ),
      isAccountEnabled: SchemaType.Optional(SchemaType.Boolean()),
      officeLocation: SchemaType.Optional(SchemaType.String()),
      usageLocation: SchemaType.Optional(
        SchemaType.String({
          description: 'A two letter country code (ISO standard 3166)',
          examples: ['US', 'JP', 'GB'],
        }),
      ),
      department: SchemaType.Optional(SchemaType.String()),
      employeeHireDate: SchemaType.Optional(
        SchemaType.Number({
          deprecated: true,
          description: 'Please use `employeeHireOn` instead',
        }),
      ),
      employeeHireOn: SchemaType.Optional(SchemaType.Number()),
      employeeType: SchemaType.Optional(SchemaType.String()),
      lastPasswordChanged: SchemaType.Optional(
        SchemaType.Number({
          deprecated: true,
          description: 'Please use `lastPasswordChangedOn` instead',
        }),
      ),
      lastPasswordChangedOn: SchemaType.Optional(SchemaType.Number()),
    }),
  });

export const [DeviceEntityMetadata, createDeviceAssignEntity] =
  createEntityMetadata({
    resourceName: '[AD] Device',
    _class: ['Device'],
    _type: createEntityType('device'),
    description: 'Azure Active Directory Device',
    schema: SchemaType.Object({
      alternativeSecurityIds: SchemaType.Optional(
        SchemaType.Array(SchemaType.String()),
      ),
      approximateLastSignInDateTime: SchemaType.Optional(
        SchemaType.Number({
          deprecated: true,
          description: 'Please use `approximateLastSignInOn` instead',
        }),
      ),
      approximateLastSignInOn: SchemaType.Optional(SchemaType.Number()),
      complianceExpirationDateTime: SchemaType.Optional(
        SchemaType.Number({
          deprecated: true,
          description: 'Please use `complianceExpirationOn` instead',
        }),
      ),
      complianceExpirationOn: SchemaType.Optional(SchemaType.Number()),
      deviceMetadata: SchemaType.Optional(
        SchemaType.Union([SchemaType.String(), SchemaType.Null()]),
      ),
      deviceVersion: SchemaType.Optional(SchemaType.Number()),
      manufacturer: SchemaType.Optional(
        SchemaType.Union([SchemaType.String(), SchemaType.Null()]),
      ),
      isCompliant: SchemaType.Optional(SchemaType.Boolean()),
      isManaged: SchemaType.Optional(SchemaType.Boolean()),
      onPremisesLastSyncDateTime: SchemaType.Optional(
        SchemaType.Number({
          deprecated: true,
          description: 'Please use `onPremisesLastSyncOn` instead',
        }),
      ),
      onPremisesLastSyncOn: SchemaType.Optional(SchemaType.Number()),
      onPremisesSyncEnabled: SchemaType.Optional(
        SchemaType.Boolean({
          deprecated: true,
          description: 'Please use `isOnPremisesSyncEnabled` instead',
        }),
      ),
      isOnPremisesSyncEnabled: SchemaType.Optional(SchemaType.Boolean()),
      operatingSystem: SchemaType.Optional(SchemaType.String()),
      operatingSystemVersion: SchemaType.Optional(SchemaType.String()),
      physicalIds: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
      profileType: SchemaType.Optional(SchemaType.String()),
      systemLabels: SchemaType.Optional(SchemaType.Array(SchemaType.String())),
      trustType: SchemaType.Optional(
        SchemaType.String([
          SchemaType.Literal('Workplace'),
          SchemaType.Literal('AzureAD'),
          SchemaType.Literal('ServerAd'),
        ]),
      ),
      registeredUsers: SchemaType.Optional(
        SchemaType.Array(SchemaType.String()),
      ),
      aadDeviceId: SchemaType.Optional(SchemaType.String()),
    }),
  });

export const [UserGroupEntityMetadata, createUserGroupAssignEntity] =
  createEntityMetadata({
    resourceName: '[AD] Group',
    _class: ['UserGroup'],
    _type: createEntityType('user_group'),
    description: 'Azure Active Directory User Group',
    schema: SchemaType.Object({
      renewedOn: SchemaType.Optional(SchemaType.Number()),
    }),
  });

export const [GroupMemberEntityMetadata, createGroupMemberAssignEntity] =
  createEntityMetadata({
    resourceName: '[AD] Group Member',
    _class: ['User'],
    /**
     * The entity type used for members of groups which are not one of the ingested
     * directory objects.
     */
    _type: createEntityType('group_member'),
    description: 'Azure Active Directory Group Member',
    schema: SchemaType.Object({}),
  });

export const [
  ServicePrincipalEntityMetadata,
  createServicePrincipalAssignEntity,
] = createEntityMetadata({
  resourceName: '[AD] Service Principal',
  _class: ['Service'],
  _type: createEntityType('service_principal'),
  description: 'Azure Active Directory Service Principal',
  schema: SchemaType.Object({
    function: SchemaType.Array(
      SchemaType.String(SchemaType.Literal('service-account')),
    ),
    userType: SchemaType.String(SchemaType.Literal('service')),
    category: SchemaType.Array(
      SchemaType.String(SchemaType.Literal('infrastructure')),
    ),
    appDisplayName: SchemaType.Optional(SchemaType.String()),
    appId: SchemaType.Optional(SchemaType.String()),
    servicePrincipalType: SchemaType.Optional(SchemaType.String()),
    servicePrincipalNames: SchemaType.Optional(
      SchemaType.Array(SchemaType.String()),
    ),
  }),
});

export const [RoleDefinitionEntityMetadata, createRoleDefinitionAssignEntity] =
  createEntityMetadata({
    resourceName: '[AD] Role Definition',
    _class: ['AccessRole'],
    _type: createEntityType('ad_role_definition'),
    description: 'Azure Active Directory Role Definition',
    schema: SchemaType.Object({
      isBuiltIn: SchemaType.Optional(SchemaType.Boolean()),
      isEnabled: SchemaType.Optional(SchemaType.Boolean()),
      allowedActions: SchemaType.Optional(
        SchemaType.Array(SchemaType.String()),
      ),
    }),
  });
