import {
  Entity,
  RelationshipClass,
  JobState,
  IntegrationError,
  createDirectRelationship,
} from '@jupiterone/integration-sdk-core';

import { IntegrationStepContext, AzureIntegrationStep } from '../../types';
import { UserRegistrationDetails, DirectoryGraphClient } from './client';
import {
  ACCOUNT_ENTITY_TYPE,
  STEP_AD_ACCOUNT,
  STEP_AD_GROUP_MEMBERS,
  STEP_AD_GROUPS,
  STEP_AD_USERS,
  GROUP_ENTITY_TYPE,
  STEP_AD_SERVICE_PRINCIPALS,
  STEP_AD_USER_REGISTRATION_DETAILS,
  ADEntities,
  ADRelationships,
  STEP_AD_ROLE_DEFINITIONS,
  STEP_AD_ROLE_ASSIGNMENTS,
  STEP_AD_DEVICES,
  STEP_AD_SERVICE_PRINCIPAL_ACCESS,
  EntityPrincipalType,
} from './constants';
import {
  createAccountEntity,
  createAccountEntityWithOrganization,
  createAccountGroupRelationship,
  createAccountUserRelationship,
  createGroupEntity,
  createUserEntity,
  createServicePrincipalEntity,
  createRoleDefinitions,
  createUserDeviceRelationship,
  createDeviceEntity,
} from './converters';
import { INGESTION_SOURCE_IDS } from '../../constants';

export async function getAccountEntity(jobState: JobState): Promise<Entity> {
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  if (!accountEntity) {
    throw new IntegrationError({
      message: 'Could not find account entity in job state',
      code: 'ACCOUNT_ENTITY_NOT_FOUND',
      fatal: true,
    });
  }

  return accountEntity;
}

export async function fetchAccount(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  let accountEntity: Entity;
  try {
    const organization = await graphClient.fetchOrganization();
    const securityDefaults =
      await graphClient.fetchIdentitySecurityDefaultsEnforcementPolicy();
    accountEntity = createAccountEntityWithOrganization(
      instance,
      organization,
      securityDefaults,
    );
  } catch (err) {
    // TODO logger.authError()
    accountEntity = createAccountEntity(instance);
  }

  await jobState.addEntity(accountEntity);
  await jobState.setData(ACCOUNT_ENTITY_TYPE, accountEntity);
}

export async function fetchUserRegistrationDetails(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  const userRegistrationDetailsMap = new Map<string, UserRegistrationDetails>();
  await graphClient.iterateUserRegistrationDetails((registrationDetails) => {
    if (registrationDetails.id) {
      userRegistrationDetailsMap.set(
        registrationDetails.id,
        registrationDetails,
      );
    }
  });

  await jobState.setData(
    'userRegistrationDetailsMap',
    userRegistrationDetailsMap,
  );
}

export async function fetchUsers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  const accountEntity = await getAccountEntity(jobState);
  const userRegistrationDetailsMap = await jobState.getData<
    Map<string, UserRegistrationDetails>
  >('userRegistrationDetailsMap');

  await graphClient.iterateUsers(async (user) => {
    const userEntity = createUserEntity(
      user,
      userRegistrationDetailsMap?.get(user.id as string),
    );
    await jobState.addEntity(userEntity);
    await jobState.addRelationship(
      createAccountUserRelationship(accountEntity, userEntity),
    );
  });
}

export async function fetchDevices(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  await graphClient.iterateDevices(async (device) => {
    const deviceEntity = createDeviceEntity(device);
    await jobState.addEntity(deviceEntity);

    if (device.registeredUsers) {
      for (const registeredUser of device.registeredUsers) {
        const userEntity = await jobState.findEntity(registeredUser.id);
        if (userEntity) {
          await jobState.addRelationship(
            createUserDeviceRelationship(userEntity, deviceEntity),
          );
        }
      }
    }
  });
}

export async function fetchGroups(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  logger.debug('Initializing directory graph client');
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  const accountEntity = await getAccountEntity(jobState);
  logger.debug('Iterating groups');
  await graphClient.iterateGroups(async (group) => {
    logger.debug({ id: group.id }, 'Creating graph objects for group');
    const groupEntity = createGroupEntity(group);
    await jobState.addEntity(groupEntity);
    await jobState.addRelationship(
      createAccountGroupRelationship(accountEntity, groupEntity),
    );
  });
}

export async function fetchGroupMembers(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  await jobState.iterateEntities(
    { _type: GROUP_ENTITY_TYPE },
    async (groupEntity) => {
      await graphClient.iterateGroupMembers(
        { groupId: groupEntity.id as string },
        async (groupMember) => {
          if (!jobState.hasKey(groupMember.id!)) {
            logger.warn(
              {
                groupId: groupEntity.id,
                groupMemberId: groupMember.id,
                groupMemberDisplayName: groupMember.displayName,
              },
              'Could not find group member',
            );
            return;
          }

          await jobState.addRelationship(
            createDirectRelationship({
              fromKey: groupEntity.id as string,
              fromType: GROUP_ENTITY_TYPE,
              _class: RelationshipClass.HAS,
              toType: convertGraphTypeTo_type(groupMember['@odata.type']),
              toKey: groupMember.id!,
            }),
          );
        },
      );
    },
  );
}

export async function fetchServicePrincipals(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  await graphClient.iterateServicePrincipals(async (sp) => {
    const servicePrincipalEntity = createServicePrincipalEntity(sp);
    await jobState.addEntity(servicePrincipalEntity);
  });
}

export async function fetchADRoleDefinitions(
  executionContext: IntegrationStepContext,
) {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  await graphClient.iterateRoleDefinitions(async (roleDefinition) => {
    await jobState.addEntity(createRoleDefinitions(roleDefinition));
  });
}

export async function fetchADRoleAssignments(
  executionContext: IntegrationStepContext,
) {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);

  await graphClient.iterateRoleAssignments(async (roleAssignments: any) => {
    const principal = await jobState.findEntity(roleAssignments.principalId);
    if (!principal) {
      logger.warn({ roleAssignments }, "Principal doesn't exist on assignment");
      return;
    }
    const role = await jobState.findEntity(roleAssignments.roleDefinitionId);
    if (!role) {
      logger.warn({ roleAssignments }, "Role doesn't exist on assignment");
      return;
    }
    await jobState.addRelationship(
      createDirectRelationship({
        from: principal,
        _class: RelationshipClass.HAS,
        to: role,
      }),
    );
  });
}

export async function fetchServicePrincipalAccess(
  executionContext: IntegrationStepContext,
) {
  const { logger, instance, jobState } = executionContext;
  const graphClient = new DirectoryGraphClient(logger, instance.config);
  await jobState.iterateEntities(
    { _type: ADEntities.SERVICE_PRINCIPAL._type },
    async (servicePrincipal) => {
      await graphClient.iterateServicePrincipalMembers(async (member) => {
        if (jobState.hasKey(member.principalId)) {
          const _type = convertPrincipalTypeTo_type(member.principalType);
          const relationship = createDirectRelationship({
            toKey: member.principalId,
            toType: _type,
            _class: RelationshipClass.ASSIGNED,
            fromKey: servicePrincipal._key,
            fromType: servicePrincipal._type,
          });
          if (jobState.hasKey(relationship._key)) {
            return;
          }
          await jobState.addRelationship(relationship);
        }
      }, servicePrincipal._key);
    },
  );
}

function convertPrincipalTypeTo_type(
  principalType: EntityPrincipalType,
): string {
  switch (principalType) {
    case EntityPrincipalType.ServicePrincipal:
      return ADEntities.SERVICE_PRINCIPAL._type;
    case EntityPrincipalType.Group:
      return ADEntities.USER_GROUP._type;
    default:
      return ADEntities.USER._type;
  }
}
function convertGraphTypeTo_type(graphType: string): string {
  switch (graphType) {
    case '#microsoft.graph.user':
      return ADEntities.USER._type;
    case '#microsoft.graph.group':
      return ADEntities.USER_GROUP._type;
    default:
      return ADEntities.GROUP_MEMBER._type;
  }
}
export const activeDirectorySteps: AzureIntegrationStep[] = [
  {
    id: STEP_AD_ACCOUNT,
    name: 'Active Directory Info',
    entities: [ADEntities.ACCOUNT],
    relationships: [],
    executionHandler: fetchAccount,
    apiPermissions: ['Directory.Read.All', 'Policy.Read.All'],
    ingestionSourceId: INGESTION_SOURCE_IDS.AD_GENERALS,
  },
  {
    id: STEP_AD_USER_REGISTRATION_DETAILS,
    name: 'Active Directory User Registration Details',
    entities: [],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchUserRegistrationDetails,
    apiPermissions: ['AuditLog.Read.All'],
  },
  {
    id: STEP_AD_USERS,
    name: 'Active Directory Users',
    entities: [ADEntities.USER],
    relationships: [ADRelationships.ACCOUNT_HAS_USER],
    dependsOn: [STEP_AD_ACCOUNT, STEP_AD_USER_REGISTRATION_DETAILS],
    executionHandler: fetchUsers,
    apiPermissions: ['Directory.Read.All'],
  },
  {
    id: STEP_AD_DEVICES,
    name: 'Active Directory Devices',
    entities: [ADEntities.DEVICE],
    relationships: [ADRelationships.USER_HAS_DEVICE],
    dependsOn: [STEP_AD_USERS],
    executionHandler: fetchDevices,
    apiPermissions: ['Device.Read.All'],
    ingestionSourceId: INGESTION_SOURCE_IDS.AD_DEVICES,
  },
  {
    id: STEP_AD_GROUPS,
    name: 'Active Directory Groups',
    entities: [ADEntities.USER_GROUP],
    relationships: [ADRelationships.ACCOUNT_HAS_GROUP],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchGroups,
    apiPermissions: ['Directory.Read.All'],
    ingestionSourceId: INGESTION_SOURCE_IDS.AD_GROUPS,
  },
  {
    id: STEP_AD_GROUP_MEMBERS,
    name: 'Active Directory Group Members',
    entities: [ADEntities.GROUP_MEMBER],
    relationships: [
      ADRelationships.GROUP_HAS_USER,
      ADRelationships.GROUP_HAS_GROUP,
      ADRelationships.GROUP_HAS_MEMBER,
    ],
    dependsOn: [STEP_AD_GROUPS, STEP_AD_USERS],
    executionHandler: fetchGroupMembers,
    apiPermissions: ['Directory.Read.All'],
  },
  {
    id: STEP_AD_SERVICE_PRINCIPALS,
    name: 'Active Directory Service Principals',
    entities: [ADEntities.SERVICE_PRINCIPAL],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchServicePrincipals,
    apiPermissions: ['Directory.Read.All'],
  },
  {
    id: STEP_AD_ROLE_DEFINITIONS,
    name: 'Active Directory Role Definitions',
    entities: [ADEntities.AD_ROLE_DEFINITION],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchADRoleDefinitions,
    apiPermissions: ['Directory.Read.All'],
  },
  {
    id: STEP_AD_ROLE_ASSIGNMENTS,
    name: 'Active Directory Role Assignments',
    entities: [],
    relationships: [
      ADRelationships.USER_HAS_ROLE,
      ADRelationships.SERVICE_PRINCIPAL_HAS_ROLE,
    ],
    dependsOn: [
      STEP_AD_ROLE_DEFINITIONS,
      STEP_AD_USERS,
      STEP_AD_SERVICE_PRINCIPALS,
    ],
    executionHandler: fetchADRoleAssignments,
    apiPermissions: ['Directory.Read.All'],
  },
  {
    id: STEP_AD_SERVICE_PRINCIPAL_ACCESS,
    name: 'Active Directory Service Principal Access',
    entities: [],
    relationships: [
      ADRelationships.SERVICE_PRINCIPAL_ASSIGNED_USER_GROUP,
      ADRelationships.SERVICE_PRINCIPAL_ASSIGNED_USER,
      ADRelationships.SERVICE_PRINCIPAL_ASSIGNED_SERVICE_PRINCIPAL,
    ],
    dependsOn: [STEP_AD_GROUPS, STEP_AD_USERS, STEP_AD_SERVICE_PRINCIPALS],
    executionHandler: fetchServicePrincipalAccess,
    apiPermissions: ['Directory.Read.All'],
  },
];
