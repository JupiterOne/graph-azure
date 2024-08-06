import {
  Entity,
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { accessPackageEntites } from './constants';
import { ApplicationPackage } from '@azure/arm-batch/esm/models';
import { generateEntityKey } from '../../../utils/generateKeys';
import { ExtendedPolicyAssignment } from './client';
import {
  createAccessPackageApproverAssignEntity,
  createAccessPackageAssignEntity,
  createAccessPackageAssignmentAssignEntity,
  createAccessPackageAssignmentPolicyAssignEntity,
  createAccessPackageCatalogAssignEntity,
  createAccessPackageRequestAssignEntity,
  createApplicationAssignEntity,
} from './entities';

export function createAccessPackageEntity(data: ApplicationPackage): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createAccessPackageAssignEntity({
        _key: generateEntityKey(data.id),
        resourceName: accessPackageEntites.STEP_ACCESS_PACKAGE.resourceName,
        name: data.id as string,
        category: ['infrastructure'],
        function: ['workflow'],
      }),
    },
  });
}

export function createAzureApplicationEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createApplicationAssignEntity({
        _key: generateEntityKey(data.appId),
        resourceName: accessPackageEntites.STEP_AZURE_APPLICATION.resourceName,
        name: data.displayName,
        id: data.id,
        publisherDomain: data.publisherDomain,
        signInAudience: data.signInAudience,
        appId: data.appId,
      }),
    },
  });
}

export function createAccessPackageAssignmentEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createAccessPackageAssignmentAssignEntity({
        _key: generateEntityKey(data.id),
        resourceName:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT.resourceName,
        name: data.id as string,
        state: data.state,
        accessPackage: data.accessPackage.id as string,
        assignmentPolicy: data.assignmentPolicy.id as string,
        userId: data.assignmentPolicy.specificAllowedTargets[0]
          .userId as string,
        groupId: data.assignmentPolicy.specificAllowedTargets[0]
          .groupId as string,
      }),
    },
  });
}

export function createAccessPackageAssignmentPolicyEntity(
  data: ExtendedPolicyAssignment,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createAccessPackageAssignmentPolicyAssignEntity({
        _key: generateEntityKey(data.id),
        resourceName:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY
            .resourceName,
        name: data.displayName as string,
        description: data.description,
        id: data.id,
        expirationEndDateTimeOn: parseTimePropertyValue(
          data.expiration?.endDateTime,
        ),
        expirationEndOn: parseTimePropertyValue(data.expiration?.endDateTime),
        expirationDuration: data.expiration?.duration,
        expirationType: data.expiration?.type,
      }),
    },
  });
}

export function createAccessPackageAssignmentRequestEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createAccessPackageRequestAssignEntity({
        _key: generateEntityKey(data.id),
        resourceName:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST
            .resourceName,
        requestType: data.requestType as string,
        state: data.state,
        status: data.status,
        id: data.id as string,
        name: data.id as string,
        title: 'Access Package Request',
        objectId: data.requestor.objectId as string,
      }),
    },
  });
}

export function createAccessPackageCatalogEntity(
  data: any,
  resourceAppId: string[],
  accessPackageId: string[],
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createAccessPackageCatalogAssignEntity({
        _key:
          accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type +
          '_' +
          generateEntityKey(data.id),
        resourceName:
          accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG.resourceName,
        name: data.displayName,
        status: data.status,
        id: data.id as string,
        catalogType: data.catalogType as string,
        state: data.state,
        description: data.description,
        resourceAppId: resourceAppId,
        accessPackageId: accessPackageId,
      }),
    },
  });
}

export function createAccessPackageAssignmentApproverEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: createAccessPackageApproverAssignEntity({
        _key: `${data.id}/requestApproverKey` as string,
        resourceName:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER
            .resourceName,
        reviewResult: data.reviewResult,
        status: data.status,
        id: data.id as string,
        name: data.reviewedBy?.userPrincipalName ?? data.id,
        reviewedById: data.reviewedBy?.id,
        displayName: data.reviewedBy?.displayName,
        title: 'request is ' + data.reviewResult,
      }),
    },
  });
}
