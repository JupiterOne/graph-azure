import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, AzureIntegrationStep } from '../../../types';
import { getAccountEntity } from '../../active-directory';
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
} from './constants';
import { createApplicationSecurityGroupEntity } from './converters';
import { INGESTION_SOURCE_IDS } from '../../../constants';

export async function fetchApplicationSecurityGroup(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  // const accountEntity = await getAccountEntity(jobState);
  // const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
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
];
