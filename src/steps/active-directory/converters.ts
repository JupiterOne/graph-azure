import map from 'lodash.map';

import {
  convertProperties,
  createIntegrationEntity,
  createDirectRelationship,
  Entity,
  getTime,
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
import {
  ACCOUNT_ENTITY_CLASS,
  ACCOUNT_ENTITY_TYPE,
  ACCOUNT_GROUP_RELATIONSHIP_TYPE,
  GROUP_ENTITY_CLASS,
  GROUP_ENTITY_TYPE,
  USER_ENTITY_CLASS,
  USER_ENTITY_TYPE,
  SERVICE_PRINCIPAL_ENTITY_CLASS,
  SERVICE_PRINCIPAL_ENTITY_TYPE,
  ADEntities,
  DEVICE_ENTITY_CLASS,
  DEVICE_ENTITY_TYPE,
  DOMAIN_ENTITY_TYPE,
  DOMAIN_ENTITY_CLASS,
} from './constants';
import { RelationshipClass } from '@jupiterone/integration-sdk-core';

export function getDomainKey(id: string) {
  return DOMAIN_ENTITY_TYPE + ':' + id;
}

export function createAccountEntity(instance: IntegrationInstance): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: ACCOUNT_ENTITY_CLASS,
        _key: generateEntityKey(instance.id),
        _type: ACCOUNT_ENTITY_TYPE,
        name: instance.name,
        displayName: instance.name,
      },
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
      assign: {
        _key: getDomainKey(data.id as string),
        _type: DOMAIN_ENTITY_TYPE,
        _class: DOMAIN_ENTITY_CLASS,
        name: `Domain: ${data.id}`,
        category: ['infrastructure'],
        function: ['IAM'],
        authenticationType: data.authenticationType,
        isAdminManaged: data.isAdminManaged,
        isDefault: data.isDefault,
        isInitial: data.isInitial,
        isRoot: data.isRoot,
        isVerified: data.isVerified,
        supportedServices: data.isVerified,
        passwordValidityPeriodInDays: data.passwordValidityPeriodInDays,
        passwordNotificationWindowInDays: data.passwordNotificationWindowInDays,
        ...passwordProperties,
      },
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
      assign: {
        _class: ACCOUNT_ENTITY_CLASS,
        _key: generateEntityKey(instance.id),
        _type: ACCOUNT_ENTITY_TYPE,
        name: organization.displayName,
        displayName: instance.name,
        organizationName: organization.displayName,
        defaultDomain,
        verifiedDomains,
        securityDefaultsEnabled: securityDefaults?.isEnabled,
        vendor: organization.displayName,
      },
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
      assign: {
        ...convertProperties(data, { parseTime: true }),
        _key: generateEntityKey(data.id),
        _class: GROUP_ENTITY_CLASS,
        _type: GROUP_ENTITY_TYPE,
        name: data.displayName,
        deletedOn: getTime(data.deletedDateTime),
        createdOn: getTime(data.createdDateTime),
        email: data.mail ?? undefined,
        renewedOn: getTime(data.renewedDateTime),
      },
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
      assign: {
        ...convertProperties(data),
        _key: generateEntityKey(data.id),
        _class: USER_ENTITY_CLASS,
        _type: USER_ENTITY_TYPE,
        name: data.displayName,
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
        officeLocation: data.officeLocation,
        usageLocation: data.usageLocation,
        department: data.department,
        employeeHireDate: (data as any).employeeHireDate,
        employeeType: (data as any).employeeType,
        lastPasswordChanged: parseTimePropertyValue(
          (data as any).lastPasswordChanged,
        ),
      },
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
      assign: {
        _key: generateEntityKey(data.id),
        _class: DEVICE_ENTITY_CLASS,
        _type: DEVICE_ENTITY_TYPE,
        name: data.displayName,
        active: data.accountEnabled,
        alternativeSecurityIds: data.alternativeSecurityIds?.map(
          (alternativeSecurityId) =>
            alternativeSecurityId.identityProvider || '',
        ),
        approximateLastSignInDateTime: parseTimePropertyValue(
          data.approximateLastSignInDateTime,
        ),
        complianceExpirationDateTime: data.complianceExpirationDateTime,
        deviceMetadata: data.deviceMetadata,
        deviceVersion: data.deviceVersion,
        manufacturer: data.manufacturer,
        displayName: data.displayName,
        isCompliant: data.isCompliant,
        isManaged: data.isManaged,
        onPremisesLastSyncDateTime: parseTimePropertyValue(
          data.onPremisesLastSyncDateTime,
        ),
        onPremisesSyncEnabled: data.onPremisesSyncEnabled,
        operatingSystem: data.operatingSystem,
        operatingSystemVersion: data.operatingSystemVersion,
        physicalIds: data.physicalIds,
        profileType: data.profileType,
        systemLabels: data.systemLabels,
        trustType: data.trustType,
        registeredUsers: data.registeredUsers?.map(
          (registeredUser) => registeredUser.id || '',
        ),
        deviceId: data.deviceId,
        aadDeviceId: data.deviceId,
        category: data.deviceCategory,
        make: data.manufacturer || 'Unknown',
        model: data.model || 'Unknown',
        serial: 'Unknown', // Serial number not provided by azure
        lastSeenOn: parseTimePropertyValue(data.approximateLastSignInDateTime),
      },
    },
  });
}

export function createServicePrincipalEntity(data: any): Entity {
  const entity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: generateEntityKey(data.id),
        _class: SERVICE_PRINCIPAL_ENTITY_CLASS,
        _type: SERVICE_PRINCIPAL_ENTITY_TYPE,
        function: ['service-account'],
        userType: 'service',
        category: ['infrastructure'],
        name: data.displayName,
        displayName: data.displayName,
        appDisplayName: data.appDisplayName,
        appId: data.appId,
        servicePrincipalType: data.servicePrincipalType,
        servicePrincipalNames: data.servicePrincipalNames,
      },
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
      assign: {
        _key: generateEntityKey(data.id),
        _class: ADEntities.AD_ROLE_DEFINITION._class,
        _type: ADEntities.AD_ROLE_DEFINITION._type,
        name: data.displayName,
        displayName: data.displayName,
        isBuiltIn: data.isBuiltIn,
        isEnabled: data.isEnabled,
        allowedActions: allowedActions,
      },
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
    fromType: ACCOUNT_ENTITY_TYPE,
    toKey: childKey,
    toType: GROUP_ENTITY_TYPE,
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
    fromType: ACCOUNT_ENTITY_TYPE,
    fromKey,
    toType: USER_ENTITY_TYPE,
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
