import { RelationshipClass } from '@jupiterone/integration-sdk-core';
import { ADEntities } from '../constants';
import {
  AccessPackageApproverEntityMetadata,
  AccessPackageAssignmentEntityMetadata,
  AccessPackageAssignmentPolicyEntityMetadata,
  AccessPackageCatalogEntityMetadata,
  AccessPackageEntityMetadata,
  AccessPackageRequestEntityMetadata,
  ApplicationEntityMetadata,
} from './entities';

export const STEP_ACCESS_PACKAGE = 'rm-access-package';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT = 'rm-access-package-assignment';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY =
  'rm-access-package-assignment-policy';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST =
  'rm-access-package-assignment-request';
export const STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER =
  'rm-access-package-assignment-approver';
export const STEP_ACCESS_PACKAGE_CATALOG = 'rm-access-package-catalog';
export const STEP_AZURE_APPLICATION = 'rm-azure-application';

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
export const STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_CATALOG_RELATIONSHIP =
  'rm-azure-application-assigned-to-access-package-catalog';
export const STEP_ACCESS_PACKAGE_HAS_APPLICATION_RELATIONSHIP =
  'rm-azure-access-package-has-application';

export const accessPackageEntites = {
  STEP_ACCESS_PACKAGE: AccessPackageEntityMetadata,
  STEP_ACCESS_PACKAGE_ASSIGNMENT: AccessPackageAssignmentEntityMetadata,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY:
    AccessPackageAssignmentPolicyEntityMetadata,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST: AccessPackageRequestEntityMetadata,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER: AccessPackageApproverEntityMetadata,
  STEP_ACCESS_PACKAGE_CATALOG: AccessPackageCatalogEntityMetadata,
  STEP_AZURE_APPLICATION: ApplicationEntityMetadata,
};

export const accessPackageRelationships = {
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP: {
    _type: 'azure_access_packages_approver_is_user',
    sourceType:
      accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER._type,
    _class: RelationshipClass.IS,
    targetType: ADEntities.USER._type,
  },
  STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP: {
    _type: 'azure_user_created_access_packages_request',
    sourceType: ADEntities.USER._type,
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
    sourceType: ADEntities.USER._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
  },
  STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP: {
    _type: 'azure_user_group_assigned_access_packages_services',
    sourceType: ADEntities.USER_GROUP._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
  },
  STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_CATALOG_RELATIONSHIP: {
    _type: 'azure_application_assigned_access_packages_catalog',
    sourceType: accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type,
    _class: RelationshipClass.ASSIGNED,
    targetType: accessPackageEntites.STEP_AZURE_APPLICATION._type,
  },
  STEP_ACCESS_PACKAGE_HAS_APPLICATION_RELATIONSHIP: {
    _type: 'azure_access_packages_services_has_application',
    sourceType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
    _class: RelationshipClass.HAS,
    targetType: accessPackageEntites.STEP_AZURE_APPLICATION._type,
  },
};

export interface AccessPackage {
  id: string;
  displayName: string;
  description: string;
  isHidden: boolean;
  createdDateTime: string;
  modifiedDateTime: string;
}
