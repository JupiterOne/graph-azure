import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { STEP_AD_ACCOUNT } from '../../active-directory/constants';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources/constants';
import { MyNetworkManagementClient } from './client';
import {
  ApplicationSecurityGroupEntities,
  AzureApplicationSecurityGroupRelationships,
  STEP_AZURE_APPLICATION_SECURITY_GROUP,
  STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION,
} from './constants';
import { steps } from '../compute/constants'
import { entities } from '../compute/constants'
import { createApplicationSecurityGroupEntity } from './converters';
import { INGESTION_SOURCE_IDS } from '../../../constants';
import { IntegrationMissingKeyError, RelationshipClass, createDirectRelationship } from '@jupiterone/integration-sdk-core';

export async function fetchApplicationSecurityGroup(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new MyNetworkManagementClient(instance.config, logger);
  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const { name } = resourceGroupEntity;
      await client.iterateApplicationSecurityGroups(
        { resourceGroupName: name as string },
        async (applicationSecurityGroup) => {
          const applicationSecurityGroupEntity =
            createApplicationSecurityGroupEntity(applicationSecurityGroup);
          await jobState.addEntity(applicationSecurityGroupEntity);
        },
      );
    },
  );
}

export async function buildAzureApplicationSecurityGroupVirtualMachineRelation(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: entities.VIRTUAL_MACHINE._type },
    async (virtualMachineEntity) => {
      let listOfApplicationSecurityGroups = virtualMachineEntity.applicationSecurityGroup as string[];
      // Iterate over each application security group if a vm
      for (const ApplicationSecurityGroup of listOfApplicationSecurityGroups) {
        // Check if ApplicationSecurityGroup is defined and non-empty
        if (ApplicationSecurityGroup.length != 0) {
          for (const applicationSecurityGroupEntityKey of ApplicationSecurityGroup) {
            if (jobState.hasKey(applicationSecurityGroupEntityKey['id'])) {
              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.PROTECTS,
                  fromKey: applicationSecurityGroupEntityKey['id'],
                  fromType: ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP._type,
                  toKey: virtualMachineEntity._key,
                  toType: entities.VIRTUAL_MACHINE._type,
                }),
              );
            } else {
              throw new IntegrationMissingKeyError(
                `Build Azure Application Security Group and Virtual Machine Relation: ${applicationSecurityGroupEntityKey['id']} Missing.`,
              );
            }
          }
        } else {
          console.log("applicationSecurityGroupEntityKey is undefined or empty.");
        }
      }
    },
  );
}




export const applicationSecurityGroupSteps: AzureIntegrationStep[] = [
  {
    id: STEP_AZURE_APPLICATION_SECURITY_GROUP,
    name: 'Application Security Group',
    entities: [
      ApplicationSecurityGroupEntities.AZURE_APPLICATION_SECURITY_GROUP,
    ],
    relationships: [],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchApplicationSecurityGroup,
    ingestionSourceId: INGESTION_SOURCE_IDS.APPLICATION_SECURITY_GROUP,
  },
  {
    id: STEP_AZURE_APPLICATION_SECURITY_GROUP_VIRTUAL_MACHINE_RELATION,
    name: 'Build Azure Application Security Group and Virtual Machine Relation',
    entities: [],
    relationships: [AzureApplicationSecurityGroupRelationships.AZURE_APPLICATION_SECURITY_GROUP_PROTECTS_VIRTUAL_MACHINE],
    dependsOn: [STEP_AZURE_APPLICATION_SECURITY_GROUP, steps.COMPUTE_VIRTUAL_MACHINES],
    executionHandler: buildAzureApplicationSecurityGroupVirtualMachineRelation,
    ingestionSourceId: INGESTION_SOURCE_IDS.APPLICATION_SECURITY_GROUP,
  }
];
