import { ComputeManagementClient } from "@azure/arm-compute";
import {
  Disk,
  VirtualMachine,
  VirtualMachineImage,
} from "@azure/arm-compute/esm/models";
import { IntegrationStepContext } from "../../../types";

export const KEY_VAULT_SERVICE_ENTITY_TYPE = "azure_keyvault_service";
export const ACCOUNT_KEY_VAULT_RELATIONSHIP_TYPE = generateRelationshipType(
  "HAS",
  ACCOUNT_ENTITY_TYPE,
  KEY_VAULT_SERVICE_ENTITY_TYPE,
);

export async function fetchVirtualMachines(
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
