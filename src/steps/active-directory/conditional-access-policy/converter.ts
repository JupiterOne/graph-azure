import {
  Entity,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk-core';
import { ConditionalAccessEntities } from './constants';

/**
 * return key: -> type:id
 * @param uid
 * @returns Conditional policy Key.
 */
export function getConditionalAccessPolicyKey(uid) {
  return `${ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type}:${uid}`;
}

/**
 * return key: -> type:id
 * @param uid
 * @returns Conditional Access Template Key.
 */
export function getConditionalAccessTemplateKey(uid) {
  return `${ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE._type}:${uid}`;
}

/**
 * return key: -> type:id
 * @param uid
 * @returns Conditional Access Named Location Key.
 */
export function getConditionalAccessNamedLocationKey(uid) {
  return `${ConditionalAccessEntities.CONDITIONAL_ACCESS_NAMED_LOCATION._type}:${uid}`;
}

/**
 * return key: -> type:id
 * @param uid
 * @returns Conditional Access Auth Context Key.
 */
export function getConditionalAccessAuthContextKey(uid) {
  return `${ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT._type}:${uid}`;
}

/**
 * return key: -> type:id
 * @param uid
 * @returns Conditional Access Service Key.
 */
export function getConditionalAccessServiceKey(uid) {
  return `${ConditionalAccessEntities.CONDITIONAL_ACCESS._type}:${uid}`;
}

/**
 * Create and returns conditional Access Policy Entity.
 * @param data : Raw policy fetched from Azure.
 * @returns Conditional Policy Entity.
 */
export function createPolicyEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._class,
        _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_POLICY._type,
        _key: getConditionalAccessPolicyKey(data.id),
        templateId: data.templateId,
        name: data.displayName,
        state: data.state,
        createdDateTime: data.createdDateTime,
        includeLocations: data.conditions.locations?.includeLocations,
        includeUsers: data.conditions.users?.includeUsers,
        includeGroups: data.conditions.users?.includeGroups,
        includeApplication: data.conditions.applications?.includeApplications,
      },
    },
  });
}

/**
 * Create and returns conditional Access Template Entity.
 * @param data : Raw template data fetched from Azure.
 * @returns Conditional Access Template Entity.
 */
export function createConditionalAccessTemplateEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE._class,
        _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_TEMPLATE._type,
        _key: getConditionalAccessTemplateKey(data.id),
        name: data.name,
        description: data.description,
        scenarios: data.scenarios,
      },
    },
  });
}

/**
 * Create and returns conditional Access Named Location Entity.
 * @param data : Raw Named Location fetched from Azure.
 * @returns Conditional Access Named Location Entity.
 */
export function createConditionalAccessNamedLocationEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class:
          ConditionalAccessEntities.CONDITIONAL_ACCESS_NAMED_LOCATION._class,
        _type:
          ConditionalAccessEntities.CONDITIONAL_ACCESS_NAMED_LOCATION._type,
        _key: getConditionalAccessNamedLocationKey(data.id),
        name: data.displayName,
        description: data.description,
        scenarios: data.scenarios,
        createdDateTime: data.createdDateTime,
        countriesAndRegions: data.countriesAndRegions,
        countryLookupMethod: data.countryLookupMethod,
      },
    },
  });
}

/**
 * Create and returns conditional Access Auth Context Entity.
 * @param data : Raw Auth Context fetched from Azure.
 * @returns Conditional Access Auth Context Entity.
 */
export function createConditionalAccessAuthContextEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class:
          ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT._class,
        _type: ConditionalAccessEntities.CONDITIONAL_ACCESS_AUTH_CONTEXT._type,
        _key: getConditionalAccessAuthContextKey(data.id),
        name: data.displayName,
        description: data.description,
        isAvailable: data.isAvailable,
      },
    },
  });
}

/**
 * Create and returns conditional Access Service Entity.
 * @param instanceId: Integration instance Id.
 * @returns Conditional Access Service Entity.
 */
export function createConditionalAccessServiceEntity(instanceId: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _class: ConditionalAccessEntities.CONDITIONAL_ACCESS._class,
        _type: ConditionalAccessEntities.CONDITIONAL_ACCESS._type,
        _key: getConditionalAccessServiceKey(instanceId),
        category: ['other'],
        function: ['access-review'],
        name: 'Conditional Access Service',
      },
    },
  });
}
