import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import {
  GROUP_ENTITY_TYPE,
  USER_ENTITY_TYPE,
} from '../../active-directory/constants';

export const STEP_ACCESS_PACKAGE = 'rm-access-package';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT = 'rm-access-package-assignment';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY =
  'rm-access-package-assignment-policy';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST =
  'rm-access-package-assignment-request';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER =
  'rm-access-package-assignment-approver';
export const STEP_ACCESS_PACKAGE_RESOURCE_APPLICATION =
  'rm-access-package-resource-application';
export const STEP_AZURE_APPLICATION =
  'rm-azure-application';

// Relationships
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP =
  'rm-access-package-assignment-approver-is-user';
export const STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP =
  'rm-azure-user-create-access-package-assignment-request';
export const STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP =
  'rm-access-package-has-access-package-assignment-relationship';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP =
  'rm-access-package-assignment-contains-access-package-assignment-policy';
export const STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP =
  'rm-azure-user-assigned-to-access-package';
export const STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP =
  'rm-azure-group-assigned-to-access-package';
export const STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_RESOURCE_RELATIONSHIP =
  'rm-access-package-resource-application-assigned-to-azure-application';

export const accessPackageEntites = {
  STEP_ACCESS_PACKAGE: {
    _type: 'azure_access_packages_services',
    _class: ['Service'],
    resourceName: '[RM] Access Package',
  },
  STEP_ACCESS_PACKAGE_ASSIGNMENT: {
    _type: 'azure_access_packages_service_assignment',
    _class: ['AccessRole'],
    resourceName: '[RM] Access Package Assignment',
  },
  STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY: {
    _type: 'azure_access_packages_policy',
    _class: ['AccessPolicy'],
    resourceName: '[RM] Access Package Assignment Policy',
  },
  STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST: {
    _type: 'azure_access_packages_request',
    _class: ['Requirement'],
    resourceName: '[RM] Access Package Assignment Request',
  },
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER: {
    _type: 'azure_access_packages_approver',
    _class: ['Review'],
    resourceName: '[RM] Access Package Assignment Approver',
  },
  STEP_ACCESS_PACKAGE_RESOURCE: {
    _type: 'azure_access_packages_resource',
    _class: ['Resource'],
    resourceName: '[RM] Access Package Resource',
  },
  STEP_AZURE_APPLICATION: {
    _type: 'azure_application',
    _class: ['Application'],
    resourceName: '[RM] Azure Application',
  }
};

export const accessPackageRelationships = {
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP: {
    _type: 'azure_access_packages_approver_is_user',
    sourceType:
      accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER._type,
    _class: RelationshipClass.IS,
    targetType: USER_ENTITY_TYPE,
  },
  STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP: {
    _type: 'azure_user_created_access_packages_request',
    sourceType: USER_ENTITY_TYPE,
    _class: RelationshipClass.CREATED,
    targetType:
      accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._type,
  },
  STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP: {
    _type: 'azure_access_packages_services_has_service_assignment',
    sourceType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
    _class: RelationshipClass.HAS,
    targetType: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type,
  },
  STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP:
    {
      _type: 'azure_access_packages_service_assignment_contains_policy',
      sourceType: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type,
      _class: RelationshipClass.CONTAINS,
      targetType:
        accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY._type,
    },
  STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP: {
    _type: 'azure_user_assigned_access_packages_services',
    sourceType: USER_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
  },
  STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP: {
    _type: 'azure_user_group_assigned_access_packages_services',
    sourceType: GROUP_ENTITY_TYPE,
    _class: RelationshipClass.ASSIGNED,
    targetType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
  },
  STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_RESOURCE_RELATIONSHIP: {
    _type: 'azure_application_assigned_access_packages_resource',
    sourceType: accessPackageEntites.STEP_ACCESS_PACKAGE_RESOURCE._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: accessPackageEntites.STEP_AZURE_APPLICATION._type,
  }
};