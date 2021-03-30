import {
  Step,
  IntegrationStepExecutionContext,
  createDirectRelationship,
  RelationshipClass,
  getRawData,
} from '@jupiterone/integration-sdk-core';
import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { getAccountEntity, STEP_AD_ACCOUNT } from '../../active-directory';
import { steps as storageSteps } from '../storage/constants';
import { steps as subscriptionSteps } from '../subscriptions/constants';
import {
  RESOURCE_GROUP_ENTITY,
  STEP_RM_RESOURCES_RESOURCE_GROUPS,
} from '../resources/constants';
import { MonitorClient } from './client';
import {
  MonitorSteps,
  MonitorEntities,
  MonitorRelationships,
} from './constants';
import {
  createActivityLogAlertEntity,
  createMonitorLogProfileEntity,
} from './converters';
import { ResourceGroup } from '@azure/arm-resources/esm/models';
import { ActivityLogAlertResource } from '@azure/arm-monitor/esm/models';
import { getResourceManagerSteps } from '../../../getStepStartStates';

export async function fetchLogProfiles(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MonitorClient(instance.config, logger);

  await client.iterateLogProfiles(async (logProfile) => {
    if (!logProfile) return;

    const logProfileEntity = await jobState.addEntity(
      createMonitorLogProfileEntity(webLinker, logProfile),
    );

    const subscriptionId = `/subscriptions/${instance.config.subscriptionId}`;
    const subscriptionEntity = await jobState.findEntity(subscriptionId);

    if (subscriptionEntity) {
      await jobState.addRelationship(
        createDirectRelationship({
          _class:
            MonitorRelationships.SUBSCRIPTION_HAS_MONITOR_LOG_PROFILE._class,
          from: subscriptionEntity,
          to: logProfileEntity,
        }),
      );
    }

    const { storageAccountId } = logProfile;
    if (!storageAccountId) return;

    const storageAccountEntity = await jobState.findEntity(storageAccountId);
    if (!storageAccountEntity) return;

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.USES,
        from: logProfileEntity,
        to: storageAccountEntity,
      }),
    );
  });
}

export async function fetchActivityLogAlerts(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await getAccountEntity(jobState);
  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new MonitorClient(instance.config, logger);

  await jobState.iterateEntities(
    { _type: RESOURCE_GROUP_ENTITY._type },
    async (resourceGroupEntity) => {
      const resourceGroup = getRawData<ResourceGroup>(resourceGroupEntity);
      if (!resourceGroup) {
        logger.warn(
          {
            id: resourceGroupEntity.id,
            _key: resourceGroupEntity._key,
            name: resourceGroupEntity.name,
          },
          'Could not fetch raw data from resource group.',
        );
        return;
      }

      await client.iterateActivityLogAlerts(
        { name: resourceGroup.name! },
        async (alert) => {
          const alertEntity = await jobState.addEntity(
            createActivityLogAlertEntity(webLinker, alert),
          );

          await jobState.addRelationship(
            createDirectRelationship({
              from: resourceGroupEntity,
              _class: RelationshipClass.HAS,
              to: alertEntity,
            }),
          );
        },
      );
    },
  );
}

export async function buildActivityLogScopeRelationships(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { logger, jobState } = executionContext;
  await jobState.iterateEntities(
    { _type: MonitorEntities.ACTIVITY_LOG_ALERT._type },
    async (alertEntity) => {
      const alert = getRawData<ActivityLogAlertResource>(alertEntity);
      if (!alert) return;

      for (const scopeId of alert.scopes) {
        const scopeEntity = await jobState.findEntity(scopeId);

        if (!scopeEntity) {
          logger.info(
            {
              alertId: alert.id,
              scopeId,
            },
            'Could not find existing entity with matching scope.',
          );
          return;
        }

        await jobState.addRelationship(
          createDirectRelationship({
            from: alertEntity,
            _class: RelationshipClass.MONITORS,
            to: scopeEntity,
          }),
        );
      }
    },
  );
}

export const monitorSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: MonitorSteps.MONITOR_LOG_PROFILES,
    name: 'Monitor Log Profiles',
    entities: [MonitorEntities.MONITOR_LOG_PROFILE],
    relationships: [
      MonitorRelationships.SUBSCRIPTION_HAS_MONITOR_LOG_PROFILE,
      MonitorRelationships.MONITOR_LOG_PROFILE_USES_STORAGE_ACCOUNT,
    ],
    dependsOn: [subscriptionSteps.SUBSCRIPTIONS, storageSteps.STORAGE_ACCOUNTS],
    executionHandler: fetchLogProfiles,
  },
  {
    id: MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS,
    name: 'Monitor Activity Log Alerts',
    entities: [MonitorEntities.ACTIVITY_LOG_ALERT],
    relationships: [MonitorRelationships.RESOURCE_GROUP_HAS_ACTIVITY_LOG_ALERT],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchActivityLogAlerts,
  },
  {
    id: MonitorSteps.MONITOR_ACTIVITY_LOG_ALERT_SCOPE_RELATIONSHIPS,
    name: 'Monitor Activity Log Alert -> Scope Relationships',
    entities: [],
    relationships: [MonitorRelationships.ACTIVITY_LOG_ALERT_MONITORS_SCOPE],
    dependsOn: [
      MonitorSteps.MONITOR_ACTIVITY_LOG_ALERTS,
      ...getResourceManagerSteps().executeFirstSteps,
    ],
    executionHandler: buildActivityLogScopeRelationships,
  },
];
