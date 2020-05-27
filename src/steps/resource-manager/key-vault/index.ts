import {
  createIntegrationRelationship,
  Entity,
} from "@jupiterone/integration-sdk";

import { createAzureWebLinker } from "../../../azure";
import { IntegrationStepContext } from "../../../types";
import { ACCOUNT_ENTITY_TYPE, STEP_AD_ACCOUNT } from "../../active-directory";
import { KeyVaultClient } from "./client";
import {
  ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
  STEP_RM_KEYVAULT_VAULTS,
} from "./constants";
import { createKeyVaultEntity } from "./converters";

export * from "./constants";

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

export const keyvaultSteps = [
  {
    id: STEP_RM_KEYVAULT_VAULTS,
    name: "Key Vaults",
    types: [KEY_VAULT_SERVICE_ENTITY_TYPE, ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE],
    dependsOn: [STEP_AD_ACCOUNT],
    executionHandler: fetchKeyVaults,
  },
];
