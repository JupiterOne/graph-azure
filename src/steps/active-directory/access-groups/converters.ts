import {
  Entity,
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { accessPackageEntites } from './constants';
import { ApplicationPackage } from '@azure/arm-batch';
import { generateEntityKey } from '../../../utils/generateKeys';
import { ExtendedPolicyAssignment } from './client';

export function createAccessPackageEntity(data: ApplicationPackage): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: accessPackageEntites.STEP_ACCESS_PACKAGE._class,
        _key: generateEntityKey(data.id),
        _type: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
        resourceName: accessPackageEntites.STEP_ACCESS_PACKAGE.resourceName,
        name: data.id as string,
        category: ['infrastructure'],
        function: ['workflow'],
      },
    },
  });
}

export function createAzureApplicationEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: accessPackageEntites.STEP_AZURE_APPLICATION._class,
        _key: generateEntityKey(data.appId),
        _type: accessPackageEntites.STEP_AZURE_APPLICATION._type,
        resourceName: accessPackageEntites.STEP_AZURE_APPLICATION.resourceName,
        name: data.displayName,
        id: data.id,
        publisherDomain: data.publisherDomain,
        signInAudience: data.signInAudience,
        appId: data.appId,
      },
    },
  });
}

export function createAccessPackageAssignmentEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._class,
        _key: generateEntityKey(data.id),
        _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type,
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
      },
    },
  });
}

export function createAccessPackageAssignmentPolicyEntity(
  data: ExtendedPolicyAssignment,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY._class,
        _key: generateEntityKey(data.id),
        _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY._type,
        resourceName:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY
            .resourceName,
        name: data.displayName as string,
        description: data.description,
        id: data.id,
        expirationEndDateTimeOn: parseTimePropertyValue(
          data.expiration?.endDateTime,
        ),
        expirationDuration: data.expiration?.duration,
        expirationType: data.expiration?.type,
      },
    },
  });
}

export function createAccessPackageAssignmentRequestEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._class,
        _key: generateEntityKey(data.id),
        _type:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._type,
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
      },
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
      assign: {
        _class: accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._class,
        _key:
          accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type +
          '_' +
          generateEntityKey(data.id),
        _type: accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type,
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
      },
    },
  });
}

export function createAccessPackageAssignmentApproverEntity(data: any): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _class:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER._class,
        _key: `${data.id}/requestApproverKey` as string,
        _type:
          accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER._type,
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
      },
    },
  });
}
