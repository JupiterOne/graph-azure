import map from 'lodash.map';

import {
  convertProperties,
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  IntegrationInstance,
  Relationship,
  assignTags,
  setRawData,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import {
  Device,
  Domain,
  Group,
  Organization,
  User,
} from '@microsoft/microsoft-graph-types';

import { generateEntityKey } from '../../utils/generateKeys';
import {
  IdentitySecurityDefaultsEnforcementPolicy,
  UserRegistrationDetails,
} from './client';
import { ACCOUNT_GROUP_RELATIONSHIP_TYPE, ADEntities } from './constants';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  createAccountAssignEntity,
  createDeviceAssignEntity,
  createDomainAssignEntity,
  createRoleDefinitionAssignEntity,
  createServicePrincipalAssignEntity,
  createUserAssignEntity,
  createUserGroupAssignEntity,
} from '../../entities';

export function getDomainKey(id: string) {
  return ADEntities.AD_DOMAIN._type + ':' + id;
}

export function createAccountEntity(instance: IntegrationInstance): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: createAccountAssignEntity({
        _key: generateEntityKey(instance.id),
        name: instance.name,
        displayName: instance.name,
        vendor: 'Microsoft',
      }),
    },
  });
}

export function createDomainEntity(data: Domain): Entity {
  const passwordProperties = {
    charactersAllowedInPassword: [
      'A - Z',
      'a - z',
      '0 - 9',
      '@ # $ % ^ & * - _ ! + = [ ] { } |  : \' , . ? / ` ~ " ( ) ; < >',
      'blank space',
    ],
    charactersNotAllowedInPassword: 'Unicode characters',
    passwordLength: [
      'A minimum of eight characters',
      'A maximum of 256 characters',
    ],
    passwordComplexity: [
      'A minimum of 8 characters and a maximum of 256 characters',
      `Requires three out of four of the following types of characters: 
      Lowercase characters 
      Uppercase characters 
      Numbers (0 - 9) 
      Symbols`,
    ],
    passwordNotRecentlyUsed: true,
    passwordIsNotBannedByMicrosoftEntraPasswordProtection: true,
    // passwordValidityPeriodInDays: passwordValidityPeriodInDays, // fetched from domain API
  };
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createDomainAssignEntity({
        _key: getDomainKey(data.id as string),
        name: `Domain: ${data.id}`,
        category: ['infrastructure'],
        function: ['IAM'],
        authenticationType: data.authenticationType,
        isAdminManaged: data.isAdminManaged,
        isDefault: data.isDefault,
        isInitial: data.isInitial,
        isRoot: data.isRoot,
        isVerified: data.isVerified,
        supportedServices: data.supportedServices,
        passwordValidityPeriodInDays: data.passwordValidityPeriodInDays,
        passwordNotificationWindowInDays: data.passwordNotificationWindowInDays,
        ...passwordProperties,
      }),
    },
  });
}

export function createAccountEntityWithOrganization(
  instance: IntegrationInstance,
  organization: Organization,
  securityDefaults?: IdentitySecurityDefaultsEnforcementPolicy,
): Entity {
  let defaultDomain: string | undefined;
  const verifiedDomains = map(organization.verifiedDomains, (e) => {
    if (e.isDefault) {
      defaultDomain = e.name;
    }
    return e.name as string;
  });

  const accountEntityWithOrganization = createIntegrationEntity({
    entityData: {
      source: organization,
      assign: createAccountAssignEntity({
        _key: generateEntityKey(instance.id),
        name: organization.displayName || instance.name,
        displayName: instance.name,
        organizationName: organization.displayName,
        defaultDomain,
        verifiedDomains,
        securityDefaultsEnabled: securityDefaults?.isEnabled,
        vendor: 'Microsoft',
      }),
    },
  });

  if (securityDefaults) {
    setRawData(accountEntityWithOrganization, {
      name: 'identitySecurityDefaultsEnforcementPolicy',
      rawData: securityDefaults,
    });
  }
  return accountEntityWithOrganization;
}

export function createGroupEntity(data: Group): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createUserGroupAssignEntity({
        ...convertProperties(data, { parseTime: true }),
        _key: generateEntityKey(data.id),
        name: data.displayName || '',
        deletedOn: parseTimePropertyValue(data.deletedDateTime),
        createdOn: parseTimePropertyValue(data.createdDateTime),
        email: data.mail ?? undefined,
        renewedOn: parseTimePropertyValue(data.renewedDateTime),
      }),
    },
  });
}

export function createUserEntity(
  data: User,
  registrationDetails?: UserRegistrationDetails,
): Entity {
  const userEntity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: createUserAssignEntity({
        ...convertProperties(data),
        _key: generateEntityKey(data.id),
        name: data.displayName || '',
        active: data.accountEnabled,
        email: data.mail ?? undefined,
        firstName: data.givenName || data.displayName?.split(' ')[0],
        lastName: data.surname || data.displayName?.split(' ').slice(-1)[0],
        username: data.userPrincipalName,
        mfaEnabled: registrationDetails?.isMfaRegistered,
        mfaType:
          registrationDetails?.userPreferredMethodForSecondaryAuthentication,
        mfaMethods: registrationDetails?.methodsRegistered,
        accountEnabled: data.accountEnabled,
        isAccountEnabled: data.accountEnabled,
        officeLocation: data.officeLocation,
        usageLocation: data.usageLocation,
        department: data.department,
        employeeHireDate: parseTimePropertyValue(
          (data as any).employeeHireDate,
        ),
        employeeHireOn: parseTimePropertyValue((data as any).employeeHireDate),
        employeeType: (data as any).employeeType,
        lastPasswordChanged: parseTimePropertyValue(
          (data as any).lastPasswordChanged,
        ),
        lastPasswordChangedOn: parseTimePropertyValue(
          (data as any).lastPasswordChanged,
        ),
      }),
    },
  });

  if (registrationDetails) {
    setRawData(userEntity, {
      name: 'registrationDetails',
      rawData: registrationDetails,
    });
  }

  return userEntity;
}

export function createDeviceEntity(
  data: Device & {
    manufacturer?: string;
    model?: string;
    deviceCategory?: string;
  },
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {
        ...data,
        registeredUsers: data.registeredUsers?.map(
          (registeredUser) => registeredUser.id,
        ),
      },
      assign: createDeviceAssignEntity({
        _key: generateEntityKey(data.id),
        name: data.displayName || '',
        active: data.accountEnabled,
        alternativeSecurityIds: data.alternativeSecurityIds?.map(
          (alternativeSecurityId) =>
            alternativeSecurityId.identityProvider || '',
        ),
        // marked deprecated in docs
        approximateLastSignInDateTime: parseTimePropertyValue(
          data.approximateLastSignInDateTime,
        ),
        approximateLastSignInOn: parseTimePropertyValue(
          data.approximateLastSignInDateTime,
        ),
        // marked deprecated in docs
        complianceExpirationDateTime: parseTimePropertyValue(
          data.complianceExpirationDateTime,
        ),
        complianceExpirationOn: parseTimePropertyValue(
          data.complianceExpirationDateTime,
        ),
        deviceMetadata: data.deviceMetadata,
        deviceVersion: data.deviceVersion,
        manufacturer: data.manufacturer,
        displayName: data.displayName,
        isCompliant: Boolean(data.isCompliant),
        isManaged: Boolean(data.isManaged),
        // marked deprecated in docs
        onPremisesLastSyncDateTime: parseTimePropertyValue(
          data.onPremisesLastSyncDateTime,
        ),
        onPremisesLastSyncOn: parseTimePropertyValue(
          data.onPremisesLastSyncDateTime,
        ),
        // marked deprecated in docs
        onPremisesSyncEnabled: Boolean(data.onPremisesSyncEnabled),
        isOnPremisesSyncEnabled: Boolean(data.onPremisesSyncEnabled),
        operatingSystem: data.operatingSystem,
        operatingSystemVersion: data.operatingSystemVersion,
        physicalIds: data.physicalIds,
        profileType: data.profileType,
        systemLabels: data.systemLabels,
        trustType: data.trustType,
        registeredUsers: data.registeredUsers?.map(
          (registeredUser) => registeredUser.id || '',
        ),
        deviceId: data.deviceId ?? null,
        aadDeviceId: data.deviceId,
        category: data.deviceCategory ?? null,
        make: data.manufacturer || 'Unknown',
        model: data.model || 'Unknown',
        serial: 'Unknown', // Serial number not provided by azure
        lastSeenOn:
          parseTimePropertyValue(data.approximateLastSignInDateTime) ?? null,
      }),
    },
  });
}

export function createServicePrincipalEntity(data: any): Entity {
  const entity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: createServicePrincipalAssignEntity({
        _key: generateEntityKey(data.id),
        function: ['service-account'],
        userType: 'service',
        category: ['infrastructure'],
        name: data.displayName,
        displayName: data.displayName,
        appDisplayName: data.appDisplayName,
        appId: data.appId,
        servicePrincipalType: data.servicePrincipalType,
        servicePrincipalNames: data.servicePrincipalNames,
      }),
    },
  });

  assignTags(entity, data.tags);
  return entity;
}
//https://learn.microsoft.com/en-us/graph/api/rbacapplication-list-roledefinitions
export function createRoleDefinitions(data: any): Entity {
  const allowedActions: string[] = [];
  if (data.rolePermissions) {
    data.rolePermissions.forEach((actions) => {
      if (actions.allowedResourceActions) {
        allowedActions.push(...actions.allowedResourceActions);
      }
    });
  }
  const entity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: createRoleDefinitionAssignEntity({
        _key: generateEntityKey(data.id),
        name: data.displayName,
        displayName: data.displayName,
        isBuiltIn: data.isBuiltIn,
        isEnabled: data.isEnabled,
        allowedActions: allowedActions,
      }),
    },
  });
  return entity;
}

export function createAccountGroupRelationship(
  account: Entity,
  group: Entity,
): Relationship {
  const parentKey = account._key;
  const childKey = generateEntityKey(group.id);

  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromKey: parentKey,
    fromType: ADEntities.ACCOUNT._type,
    toKey: childKey,
    toType: ADEntities.USER_GROUP._type,
    properties: {
      _type: ACCOUNT_GROUP_RELATIONSHIP_TYPE,
    },
  });
}

export function createAccountUserRelationship(
  account: Entity,
  user: Entity,
): Relationship {
  const fromKey = account._key;
  const toKey = generateEntityKey(user.id);

  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    fromType: ADEntities.ACCOUNT._type,
    fromKey,
    toType: ADEntities.USER._type,
    toKey,
  });
}

export function createUserDeviceRelationship(
  user: Entity,
  device: Entity,
): Relationship {
  return createDirectRelationship({
    _class: RelationshipClass.HAS,
    from: user,
    to: device,
  });
}
