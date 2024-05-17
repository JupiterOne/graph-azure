import {
  RelationshipClass,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { AzureIntegrationStep, IntegrationStepContext } from '../../../types';
import { AccessPackageClient } from './client';
import {
  STEP_ACCESS_PACKAGE,
  STEP_ACCESS_PACKAGE_ASSIGNMENT,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
  STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
  STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
  STEP_ACCESS_PACKAGE_CATALOG,
  STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_CATALOG_RELATIONSHIP,
  STEP_AZURE_APPLICATION,
  STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
  STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
  accessPackageEntites,
  accessPackageRelationships,
} from './constants';
import {
  createAccessPackageAssignmentApproverEntity,
  createAccessPackageAssignmentEntity,
  createAccessPackageAssignmentPolicyEntity,
  createAccessPackageAssignmentRequestEntity,
  createAccessPackageCatalogEntity,
  createAccessPackageEntity,
  createAzureApplicationEntity,
} from './converters';
import {
  GROUP_ENTITY_TYPE,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  USER_ENTITY_TYPE,
} from '../../active-directory/constants';

export async function fetchAccessPackages(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);
  await graphClient.iterateAccessPackage(async (packages) => {
    const accessPackageEntity = createAccessPackageEntity(packages);
    await jobState.addEntity(accessPackageEntity);
    await jobState.setData(
      accessPackageEntites.STEP_ACCESS_PACKAGE._type,
      accessPackageEntity,
    );
  });
}

export async function fetchAccessPackageAssignment(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);
  await graphClient.iterateAccessPackageAssignment(async (assignment) => {
    const accessPackageAssignmentEntity =
      createAccessPackageAssignmentEntity(assignment);
    await jobState.addEntity(accessPackageAssignmentEntity);
    await jobState.setData(
      accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type,
      accessPackageAssignmentEntity,
    );
  });
}

export async function fetchAccessPackageAssignmentPolicy(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);
  await graphClient.iterateAccessPackageAssignmentPolicy(async (policy) => {
    const accessPackageAssignmentPolicyEntity =
      createAccessPackageAssignmentPolicyEntity(policy);
    await jobState.addEntity(accessPackageAssignmentPolicyEntity);
    await jobState.setData(
      accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY._type,
      accessPackageAssignmentPolicyEntity,
    );
  });
}

export async function fetchAccessPackageAssignmentRequest(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);
  await graphClient.iterateAccessPackageAssignmentRequest(async (request) => {
    const accessPackageAssignmentRequestEntity =
      createAccessPackageAssignmentRequestEntity(request);
    await jobState.addEntity(accessPackageAssignmentRequestEntity);
    await jobState.setData(
      accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._type,
      accessPackageAssignmentRequestEntity,
    );
  });
}

export async function fetchAccessPackageAssignmentApprover(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);
  await jobState.iterateEntities(
    {
      _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._type,
    },
    async (request) => {
      await graphClient.iterateAccessPackageAssignmentApprover(
        { requestId: request.id as string },
        async (approver) => {
          const accessPackageAssignmentApproverEntity =
            createAccessPackageAssignmentApproverEntity(approver);
          await jobState.addEntity(accessPackageAssignmentApproverEntity);
          await jobState.setData(
            accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER._type,
            accessPackageAssignmentApproverEntity,
          );
        },
      );
    },
  );
}

export async function fetchAccessPackageCatalog(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);

  await graphClient.iterateAccessPackagecatalog(async (catalog) => {
    const catalogId = catalog.id as string;

    const resourceAppIds: string[] = [];

    await graphClient.iterateAccessPackageResource(
      { catalogId },
      async (resource) => {
        if (resource.originSystem === 'AadApplication') {
          resourceAppIds.push(resource.description);
        }
      }
    );
    if (resourceAppIds.length > 0) {
      const accessPackageResourceApplicationEntity = createAccessPackageCatalogEntity(catalog, resourceAppIds);
      await jobState.addEntity(accessPackageResourceApplicationEntity);
      await jobState.setData(
        accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type,
        accessPackageResourceApplicationEntity,
      );
    }
  });
}

export async function fetchAzureApplication(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new AccessPackageClient(logger, instance.config);
  await graphClient.iterateAzureApplications(async (application) => {
    const azureApplicationEntity =
      createAzureApplicationEntity(application);
    await jobState.addEntity(azureApplicationEntity);
  });
}

export async function buildAccessPackageApproverIsAzureUserRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    {
      _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER._type,
    },
    async (approver) => {
      const userKey = approver.reviewedById as string;
      if (jobState.hasKey(userKey)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.IS,
            fromKey: approver._key,
            fromType:
              accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER
                ._type,
            toKey: userKey,
            toType: USER_ENTITY_TYPE,
          }),
        );
      }
    },
  );
}

export async function buildApplicationAssignedToCatalogRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    {
      _type: accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type,
    },
    async (catalogEntity) => {
      const resourceAppIds = catalogEntity.resourceAppId as string[];
      const appIdPattern = /AppId:\s*([a-f0-9-]+)/i;

      for (const resourceAppId of resourceAppIds) {
        const match = resourceAppId.match(appIdPattern);
        const applicationKey = match ? match[1] : null;

        if (applicationKey) {
          if (await jobState.hasKey(applicationKey)) { // Await the hasKey check
            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.ASSIGNED,
                fromKey: applicationKey,
                fromType: accessPackageEntites.STEP_AZURE_APPLICATION._type,
                toKey: catalogEntity._key,
                toType: accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG._type,
              }),
            );
          }
        } else {
          console.error("Application key not found in resourceAppId:", resourceAppId);
        }
      }
    },
  );
}


export async function buildAzureUserCreatedAccessPackageAssignmentRequestRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    {
      _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._type,
    },
    async (request) => {
      const userKey = request.objectId as string;
      if (jobState.hasKey(userKey)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CREATED,
            fromKey: userKey,
            fromType: USER_ENTITY_TYPE,
            toKey: request._key,
            toType:
              accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST._type,
          }),
        );
      }
    },
  );
}

export async function buildAccessPackageHasAccessPackageAssignmentRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type },
    async (assignment) => {
      const accessPackageKey = assignment.accessPackage as string;
      if (jobState.hasKey(accessPackageKey)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            fromKey: accessPackageKey,
            fromType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
            toKey: assignment._key,
            toType: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type,
          }),
        );
      }
    },
  );
}

export async function buildAccessPackageAssignmentContainsAccessPackageAssignmentPolicyRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type },
    async (assignment) => {
      const accessPackageAssignmentPolicyKey =
        assignment.assignmentPolicy as string;
      if (jobState.hasKey(accessPackageAssignmentPolicyKey)) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.CONTAINS,
            fromKey: assignment._key,
            fromType: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type,
            toKey: accessPackageAssignmentPolicyKey,
            toType:
              accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY._type,
          }),
        );
      }
    },
  );
}

export async function buildAzureUserAssignedToAccessPackageRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  const processedRelationships = new Set<string>();
  await jobState.iterateEntities(
    { _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type },
    async (assignment) => {
      const accessPackageKey = assignment.accessPackage as string;
      const userKey = assignment.userId as string;
      const relationshipKey = `${userKey}|assigned|${accessPackageKey}`;
      if (!processedRelationships.has(relationshipKey)) {
        if (jobState.hasKey(accessPackageKey) && jobState.hasKey(userKey)) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.ASSIGNED,
              fromKey: userKey,
              fromType: USER_ENTITY_TYPE,
              toKey: accessPackageKey,
              toType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
            }),
          );
          processedRelationships.add(relationshipKey);
        }
      }
    },
  );
}

export async function buildAzureGroupAssignedToAccessPackageRelationship(
  executionContext: IntegrationStepContext,
) {
  const { jobState } = executionContext;
  const processedRelationships = new Set<string>();
  await jobState.iterateEntities(
    { _type: accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT._type },
    async (assignment) => {
      const accessPackageKey = assignment.accessPackage as string;
      const groupId = assignment.groupId as string;
      const relationshipKey = `${groupId}|assigned|${accessPackageKey}`;
      if (!processedRelationships.has(relationshipKey)) {
        if (jobState.hasKey(accessPackageKey) && jobState.hasKey(groupId)) {
          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.ASSIGNED,
              fromKey: groupId,
              fromType: GROUP_ENTITY_TYPE,
              toKey: accessPackageKey,
              toType: accessPackageEntites.STEP_ACCESS_PACKAGE._type,
            }),
          );
          processedRelationships.add(relationshipKey);
        }
      }
    },
  );
}

export const accessPackageSteps: AzureIntegrationStep[] = [
  {
    id: STEP_ACCESS_PACKAGE,
    name: 'Entitlement Management Access Package',
    entities: [accessPackageEntites.STEP_ACCESS_PACKAGE],
    relationships: [],
    dependsOn: [],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAccessPackages,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_ASSIGNMENT,
    name: 'Entitlement Management Access Package Assignment',
    entities: [accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT],
    relationships: [],
    dependsOn: [],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAccessPackageAssignment,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
    name: 'Entitlement Management Access Package Assignment Policy',
    entities: [accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY],
    relationships: [],
    dependsOn: [],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAccessPackageAssignmentPolicy,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST,
    name: 'Entitlement Management Access Package Assignment Request',
    entities: [accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST],
    relationships: [],
    dependsOn: [],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAccessPackageAssignmentRequest,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER,
    name: 'Entitlement Management Access Package Assignment Approver',
    entities: [accessPackageEntites.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER],
    relationships: [],
    dependsOn: [STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAccessPackageAssignmentApprover,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_CATALOG,
    name: 'Entitlement Management Access Package Catalog',
    entities: [accessPackageEntites.STEP_ACCESS_PACKAGE_CATALOG],
    relationships: [],
    dependsOn: [],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAccessPackageCatalog,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },
  {
    id: STEP_AZURE_APPLICATION,
    name: 'Entitlement Management Access Package Catalog',
    entities: [accessPackageEntites.STEP_AZURE_APPLICATION],
    relationships: [],
    dependsOn: [],
    rolePermissions: ['EntitlementManagement.ReadWrite.All'],
    executionHandler: fetchAzureApplication,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },
  {
    id: STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_CATALOG_RELATIONSHIP,
    name: 'Entitlement Management Resource Application Assigned To Access Catalog',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_AZURE_APPLICATION_ASSIGNED_TO_ACCESS_PACKAGE_CATALOG_RELATIONSHIP,
    ],
    dependsOn: [STEP_ACCESS_PACKAGE_CATALOG, STEP_AZURE_APPLICATION],
    rolePermissions: [],
    executionHandler: buildApplicationAssignedToCatalogRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },
  {
    id: STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
    name: 'Entitlement Management Access Package Approver IS Azure User',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER_IS_AZURE_USER_RELATIONSHIP,
    ],
    dependsOn: [STEP_ACCESS_PACKAGE_ASSIGNMENT_APPROVER, STEP_AD_USERS],
    rolePermissions: [],
    executionHandler: buildAccessPackageApproverIsAzureUserRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
    name: 'Azure user Created Entitlement Management Access Package Request',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_AZURE_USER_CREATED_ACCESS_PACKAGE_ASSIGNMENT_REQUEST_RELATIONSHIP,
    ],
    dependsOn: [STEP_ACCESS_PACKAGE_ASSIGNMENT_REQUEST, STEP_AD_USERS],
    rolePermissions: [],
    executionHandler:
      buildAzureUserCreatedAccessPackageAssignmentRequestRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
    name: 'Access Package HAS Access Package Assignment',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_ACCESS_PACKAGE_HAS_ACCESS_PACKAGE_ASSIGNMENT_RELATIONSHIP,
    ],
    dependsOn: [STEP_ACCESS_PACKAGE, STEP_ACCESS_PACKAGE_ASSIGNMENT],
    rolePermissions: [],
    executionHandler: buildAccessPackageHasAccessPackageAssignmentRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
    name: 'Access Package Assignment Contains Access Package Assignment Policy',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_ACCESS_PACKAGE_ASSIGNMENT_CONTAINS_ACCESS_PACKAGE_ASSIGNMENT_POLICY_RELATIONSHIP,
    ],
    dependsOn: [
      STEP_ACCESS_PACKAGE_ASSIGNMENT_POLICY,
      STEP_ACCESS_PACKAGE_ASSIGNMENT,
    ],
    rolePermissions: [],
    executionHandler:
      buildAccessPackageAssignmentContainsAccessPackageAssignmentPolicyRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
    name: 'Azure user assigned to Access Package',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_AZURE_USER_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
    ],
    dependsOn: [
      STEP_ACCESS_PACKAGE,
      STEP_ACCESS_PACKAGE_ASSIGNMENT,
      STEP_AD_USERS,
    ],
    rolePermissions: [],
    executionHandler: buildAzureUserAssignedToAccessPackageRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },

  {
    id: STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
    name: 'Azure Group assigned to Access Package',
    entities: [],
    relationships: [
      accessPackageRelationships.STEP_AZURE_GROUP_ASSIGNED_TO_ACCESS_PACKAGE_RELATIONSHIP,
    ],
    dependsOn: [
      STEP_ACCESS_PACKAGE,
      STEP_ACCESS_PACKAGE_ASSIGNMENT,
      STEP_AD_GROUPS,
    ],
    rolePermissions: [],
    executionHandler: buildAzureGroupAssignedToAccessPackageRelationship,
    ingestionSourceId: INGESTION_SOURCE_IDS.ACCESS_PACKAGE,
  },
];
