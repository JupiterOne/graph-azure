import {
  createDirectRelationship,
  Entity,
  RelationshipClass,
  Step,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { createAzureWebLinker } from '../../../azure';
import { IntegrationStepContext, IntegrationConfig } from '../../../types';
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from '../../active-directory';
import { KeyVaultClient } from './client';
import {
  ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
  KEY_VAULT_SERVICE_ENTITY_CLASS,
  ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
  KeyVaultRelationships,
} from './constants';
import { createKeyVaultEntity } from './converters';
import { STEP_RM_RESOURCES_RESOURCE_GROUPS } from '../resources';
import createResourceGroupResourceRelationship, {
  createResourceGroupResourceRelationshipMetadata,
} from '../utils/createResourceGroupResourceRelationship';
import { fetchDiagnosticSettings } from '../monitor/diagnostic-settings';
import { MonitorEntities, MonitorRelationships } from '../monitor/constants';

export * from './constants';

export async function fetchKeyVaults(
  executionContext: IntegrationStepContext,
): Promise<void> {
  const { instance, logger, jobState } = executionContext;
  const accountEntity = await jobState.getData<Entity>(ACCOUNT_ENTITY_TYPE);

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain as string);
  const client = new KeyVaultClient(instance.config, logger);

  await client.iterateKeyVaults(async (vault) => {
    const vaultEntity = createKeyVaultEntity(webLinker, vault);
    await jobState.addEntity(vaultEntity);
    await createResourceGroupResourceRelationship(
      executionContext,
      vaultEntity,
    );
    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: vaultEntity,
      }),
    );

    await fetchDiagnosticSettings(executionContext, vaultEntity);
  });
}

export const keyvaultSteps: Step<
  IntegrationStepExecutionContext<IntegrationConfig>
>[] = [
  {
    id: STEP_RM_KEYVAULT_VAULTS,
    name: 'Key Vaults',
    entities: [
      {
        resourceName: '[RM] Key Vault',
        _type: KEY_VAULT_SERVICE_ENTITY_TYPE,
        _class: KEY_VAULT_SERVICE_ENTITY_CLASS,
      },
      MonitorEntities.DIAGNOSTIC_LOG_SETTING,
      MonitorEntities.DIAGNOSTIC_METRIC_SETTING
    ],
    relationships: [
      {
        _type: ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
        sourceType: ACCOUNT_ENTITY_TYPE,
        _class: ACCOUNT_KEY_VAULT_RELATIONSHIP_CLASS,
        targetType: KEY_VAULT_SERVICE_ENTITY_TYPE,
      },
      createResourceGroupResourceRelationshipMetadata(
        KEY_VAULT_SERVICE_ENTITY_TYPE,
      ),
      KeyVaultRelationships.KEY_VAULT_HAS_MONITOR_DIAGNOSTIC_LOG_SETTING,
      KeyVaultRelationships.KEY_VAULT_HAS_MONITOR_DIAGNOSTIC_METRIC_SETTING,
      MonitorRelationships.DIAGNOSTIC_LOG_SETTING_USES_STORAGE_ACCOUNT,
      MonitorRelationships.DIAGNOSTIC_METRIC_SETTING_USES_STORAGE_ACCOUNT
    ],
    dependsOn: [STEP_AD_ACCOUNT, STEP_RM_RESOURCES_RESOURCE_GROUPS],
    executionHandler: fetchKeyVaults,
  },
];
