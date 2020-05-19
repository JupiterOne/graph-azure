import {
  createIntegrationRelationship,
  Entity,
  generateRelationshipType,
} from "@jupiterone/integration-sdk";

import { createAzureWebLinker } from "../../../azure";
import { ACCOUNT_ENTITY_TYPE } from "../../../jupiterone";
import { IntegrationStepContext } from "../../../types";
import { KeyVaultClient } from "./client";
import { createKeyVaultEntity } from "./converters";

export const KEY_VAULT_SERVICE_ENTITY_TYPE = "azure_keyvault_service";
export const ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  ACCOUNT_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
);

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
    await jobState.addRelationship(
      createIntegrationRelationship({
        _class: "HAS",
        from: accountEntity,
        to: vaultEntity,
      }),
    );
  });
}
