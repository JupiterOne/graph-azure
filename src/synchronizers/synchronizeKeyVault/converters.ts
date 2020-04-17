import { AzureWebLinker } from "../../azure";
import { Vault } from "@azure/arm-keyvault/esm/models";
import {
  EntityFromIntegration,
  createIntegrationEntity,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { resourceGroupName, normalizeLocation } from "../../azure/utils";

export function createKeyVaultEntity(
  webLinker: AzureWebLinker,
  data: Vault,
): EntityFromIntegration {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.id,
        _type: "azure_keyvault_service",
        _class: ["Service"],
        webLink: webLinker.portalResourceUrl(data.id),
        region: normalizeLocation(data.location),
        resourceGroup: resourceGroupName(data.id),
        endpoints: [data.properties.vaultUri],
        category: ["infrastructure"],
      },
      tagProperties: ["environment"],
    },
  });
}
