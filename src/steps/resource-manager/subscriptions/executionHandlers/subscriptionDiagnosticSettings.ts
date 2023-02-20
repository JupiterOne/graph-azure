import {
  IntegrationStepContext,
  AzureIntegrationStep,
} from '../../../../types';
import { steps as storageSteps } from '../../storage/constants';
import {
  createDiagnosticSettingsEntitiesAndRelationshipsForResource,
  diagnosticSettingsEntitiesForResource,
  getDiagnosticSettingsRelationshipsForResource,
} from '../../utils/createDiagnosticSettingsEntitiesAndRelationshipsForResource';
import { entities, steps } from '../constants';

export async function fetchSubscriptionDiagnosticSettings(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { jobState } = executionContext;

  await jobState.iterateEntities(
    { _type: entities.SUBSCRIPTION._type },
    async (subscriptionEntity) => {
      await createDiagnosticSettingsEntitiesAndRelationshipsForResource(
        executionContext,
        subscriptionEntity,
      );
    },
  );
}

export const subscriptionDiagnosticSettingSteps: AzureIntegrationStep[] = [
  {
    id: steps.SUBSCRIPTION_DIAGNOSTIC_SETTINGS,
    name: 'Subscription Diagnostic Settings',
    entities: [...diagnosticSettingsEntitiesForResource],
    relationships: [
      ...getDiagnosticSettingsRelationshipsForResource(entities.SUBSCRIPTION),
    ],
    dependsOn: [steps.SUBSCRIPTION, storageSteps.STORAGE_ACCOUNTS],
    executionHandler: fetchSubscriptionDiagnosticSettings,
    rolePermissions: ['Microsoft.Insights/DiagnosticSettings/Read'],
  },
];
