import { INGESTION_SOURCE_IDS } from '../../../constants';
import { AzureIntegrationStep, IntegrationStepContext } from '../../../types';
import { Ddos } from './client';
import { Ddos_Entities, DDOS_STEPS } from './constant';
import { createProtectionPlanEntity } from './converter';

export async function fetchProtectionPlans(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const client = new Ddos(instance.config, logger);

  await client.iterateDdosProtectionPlan(async (protection_plan) => {
    const protectionPlanEntity = createProtectionPlanEntity(protection_plan);
    await jobState.addEntity(protectionPlanEntity);
  });
}

export const DdosServiceSteps: AzureIntegrationStep[] = [
  {
    id: DDOS_STEPS.PROTECTION_PLAN,
    name: 'Fetch Ddos Protection Plan',
    entities: [Ddos_Entities.protection_plan],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchProtectionPlans,
    rolePermissions: ['Microsoft.Network/ddosProtectionPlans/read'],
    ingestionSourceId: INGESTION_SOURCE_IDS.DDOS,
  },
];
