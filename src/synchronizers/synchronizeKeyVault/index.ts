import {
  createIntegrationRelationship,
  DataModel,
  IntegrationError,
  IntegrationExecutionResult,
  PersisterOperationsResult,
  summarizePersisterOperationsResults,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { createAzureWebLinker } from "../../azure";
import { AccountEntity } from "../../jupiterone";
import { AzureExecutionContext } from "../../types";
import { KeyVaultClient } from "./client";
import { createKeyVaultEntity } from "./converters";

export default async function synchronizeKeyVaults(
  executionContext: AzureExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, logger, instance } = executionContext;
  const cache = executionContext.clients.getCache();

  const accountEntity = (await cache.getEntry("account")).data as AccountEntity;
  if (!accountEntity) {
    throw new IntegrationError(
      "Account fetch did not complete, cannot synchronize storage resources",
    );
  }

  const webLinker = createAzureWebLinker(accountEntity.defaultDomain);

  const client = new KeyVaultClient(instance.config, logger);

  const results: PersisterOperationsResult[] = [];

  // Process one vault at a time
  await client.iterateKeyVaults(async (vault) => {
    const newVaultEntity = createKeyVaultEntity(webLinker, vault);
    const oldVaultEntities = await graph.findEntitiesByType(
      "azure_keyvault_service",
      { _key: newVaultEntity._key },
    );

    const newAccountServiceRelationship = createIntegrationRelationship({
      _class: 'HAS',
      from: accountEntity,
      to: newVaultEntity,
    });

    const oldAccountServiceRelationships = await graph.findRelationshipsByType(
      newAccountServiceRelationship._type,
      {
        keyvaultId: vault.id,
      },
    );

    // TODO Need to make sure we cannot get these through @azure/arm-keyvault
    // TODO Need to figure out what permissions customers will need to grant listing keys
    // client.iterateKeys(vault.name);

    results.push(
      await persister.publishPersisterOperations([
        [...persister.processEntities(oldVaultEntities, [newVaultEntity])],
        [
          ...persister.processRelationships(oldAccountServiceRelationships, [
            newAccountServiceRelationship,
          ]),
        ],
      ]),
    );
  });

  return {
    operations: summarizePersisterOperationsResults(...results),
  };
}
